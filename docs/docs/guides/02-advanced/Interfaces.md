---
permalink: guides/interfaces
category: Advanced guides
---

# Interfaces

Ý tưởng chính của TypeGraphQL là tạo các loại GraphQL dựa trên các lớp TypeScript.

Trong lập trình hướng đối tượng, người ta thường tạo ra các giao diện mô tả hợp đồng mà 
các lớp thực hiện chúng phải tuân thủ. Do đó, TNGraphQL hỗ trợ xác định GraphQL interface.

Đọc thêm về GraphQL interface trong [tài liệu chính thức của GraphQL](https://graphql.org/learn/schema/#interfaces).

## Sử dụng

TypeScript có hỗ trợ cho các interface.
Thật không may, chúng chỉ tồn tại vào thời gian biên dịch, 
vì vậy chúng tôi không thể sử dụng chúng để xây dựng lược đồ GraphQL 
khi chạy bằng cách sử dụng các trình trang trí.

May mắn thay, chúng ta có thể sử dụng một lớp trừu tượng cho mục đích này.
Nó hoạt động gần giống như một interface - nó không thể được "làm mới"
nhưng nó có thể được implemented bởi class - và nó sẽ không ngăn các 
nhà phát triển thực hiện một phương thức hoặc khởi tạo một trường. 
Vì vậy, miễn là chúng ta coi nó như một interface, chúng ta có thể sử dụng nó một cách an toàn.

Làm cách nào để tạo định nghĩa GraphQL interface?
Chúng tôi tạo ra một abstract class và trang trí nó với `@InterfaceType()`.
Phần còn lại hoàn toàn giống với các `ObjectType`: chúng tôi sử dụng trình trang trí `@Field`
để khai báo hình dạng của loại:

[codegroup]
```ts{}{InterfaceType}
@InterfaceType()
abstract class IPerson {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field(type => Int)
  age: number;
}
```
```ts{}{ObjectType}
@ObjectType({ implements: IPerson })
class Person implements IPerson {
  id: string;
  name: string;
  age: number;
}
```
[/codegroup]

Sự khác biệt duy nhất là chúng ta phải cho TNGraphQL biết được `ObjectType` đang thực hiện `InterfaceType`. 
Chúng tôi làm điều này bằng cách chuyển param `({ implements: IPerson })` cho ObjectType. 
Nếu chúng ta thực hiện nhiều giao diện, chúng ta sẽ vượt qua một loạt các giao diện như vậy:
`({ implements: [IPerson, IAnimal, IMachine] })`.

Chúng tôi cũng có thể bỏ qua các trình trang trí vì các GraphQL types sẽ được sao chép 
từ interface - theo cách này chúng tôi sẽ không phải duy trì hai định nghĩa và 
chỉ dựa vào kiểm tra loại TypeScript để thực hiện giao diện chính xác.


## Resolving Type

[note]
Xin lưu ý rằng khi object type của chúng tôi đang triển khai GraphQL interface, 
**chúng tôi phải trả về một thể hiện của type class** trong resolve của chúng tôi. 
`graphql-js` sẽ không thể phát hiện chính xác GraphQL type bên dưới.
[/note]

Chúng tôi cũng có thể cung cấp `resolveType` thực hiện chức năng riêng của 
chúng tôi cho các `@InterfaceType` tùy chọn. 
Bằng cách này, chúng ta có thể trả về các đối tượng đơn giản trong các resolvers
và sau đó xác định loại đối tượng được trả về bằng cách kiểm tra hình dạng của đối tượng dữ liệu,
giống như trong các `union` , ví dụ:

```ts
@InterfaceType({
  resolveType: value => {
    if ("grades" in value) {
      return "Student"; // schema name of the type as a string
    }
    return Person; // or the object type class
  },
})
abstract class IPerson {
  // ...
}
```

Tuy nhiên, trong trường hợp của các interface,
nó có thể phức tạp hơn một chút so với các union,
vì chúng ta có thể không nhớ tất cả các Object type thực hiện interface này.
