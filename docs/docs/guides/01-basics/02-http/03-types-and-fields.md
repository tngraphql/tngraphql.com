--- 
permalink: guides/http/types-and-fields
category: The Basics
---

# Types And Fields

Ý tưởng chính của TNGraphQL là tự động tạo các định nghĩa lược đồ GraphQL từ các lớp TypeScript. 
Để tránh sự cần thiết cho các tệp và giao diện định nghĩa lược đồ mô tả lược đồ, 
chúng tôi sử dụng các trang trí và một chút reflection magic.

Hãy bắt đầu bằng cách định nghĩa lớp TypeScript `Recipe` 
mẫu của chúng tôi đại diện cho mô hình của chúng tôi với các trường để lưu trữ dữ liệu công thức:
```ts
class Recipe {
  id: string;
  title: string;
  ratings: Rate[];
  averageRating?: number;
}
```

Điều đầu tiên chúng ta phải làm là trang trí class với trang trí`@ObjectType`.
Nó đánh dấu class là class `type` được biết đến từ GraphQL SDL hoặc `GraphQLObjectType` từ graphql-js:
```ts
@ObjectType()
class Recipe {
  id: string;
  title: string;
  ratings: Rate[];
  averageRating: number;
}
```

Sau đó, chúng tôi khai báo các thuộc tính lớp nào sẽ được ánh xạ tới các trường GraphQL. 
Để làm điều này, chúng tôi sử dụng trình trang trí `@Field`, 
cũng được sử dụng để thu thập siêu dữ liệu từ hệ thống phản chiếu TypeScript:
```ts
@ObjectType()
class Recipe {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  ratings: Rate[];

  @Field()
  averageRating: number;
}
```

Đối với các loại đơn giản (như `string` hoặc `boolean`), 
đây là tất cả những gì cần thiết nhưng do hạn chế trong phản ánh của TypeScript, 
chúng tôi cần cung cấp thông tin về các loại chung (như `Array` hoặc `Promise`). 
Vì vậy, để khai báo `Rate[]` loại, chúng tôi có hai tùy chọn có sẵn:

- `@Field(type => [Rate])` (được khuyến nghị, [ ] cú pháp rõ ràng cho các loại Mảng)
- `@Field(itemType => Rate)` ( `array` được suy ra từ reflection - cũng hoạt động nhưng dễ bị lỗi)

Tuy nhiên, đối với các mảng lồng nhau, [ ] ký hiệu rõ ràng là cần thiết để xác định độ sâu của mảng.
`@Field(type => [[Int]])` sẽ nói với trình biên dịch, 
chúng tôi mong đợi một mảng số nguyên có chiều sâu 2.

Tại sao sử dụng cú pháp hàm và không phải là một `{ type: Rate }` đối tượng cấu hình đơn giản? 
Bởi vì, bằng cách sử dụng cú pháp hàm, chúng tôi giải quyết vấn đề phụ thuộc vòng tròn 
(ví dụ: posts <-> users), do đó, nó đã được sử dụng như một quy ước.
Bạn có thể sử dụng cú pháp tốc ký `@Field(() => Rate)`
nếu bạn muốn lưu một số tổ hợp phím nhưng nó có thể khó đọc hơn đối với những người khác.

Theo mặc định, tất cả các trường là không thể rỗng, 
giống như các thuộc tính trong TypeScript. 
Tuy nhiên, bạn có thể thay đổi hành vi đó bằng cách cung cấp `nullableByDefault: true`
tùy chọn trong `/app/GraphQL/kernel.ts` cài đặt, được mô tả trong [hướng dẫn bootstrap]().

Vì vậy, đối với các thuộc tính `nullable` `averageRating` có thể không được xác định khi công thức 
chưa có xếp hạng, chúng tôi đánh dấu thuộc tính lớp là tùy chọn với toán tử ?: và cũng phải truyền 
tham số trang trí `{ nullable: true }`. 
Chúng ta nên lưu ý rằng khi chúng ta khai báo loại của mình là một liên kết `nullable` (ví dụ `string | null`), 
chúng ta cần cung cấp rõ ràng loại cho trình trang trí `@Field`.

Trong trường hợp danh sách, chúng tôi cũng có thể cần xác định tính nullable của chúng ở dạng chi tiết hơn. 
`{ nullable: true | false }` Cài đặt cơ bản chỉ áp dụng cho toàn bộ danh sách ( `[Item!]` hoặc `[Item!]!`), 
vì vậy nếu chúng ta cần một mảng thưa thớt, chúng ta có thể kiểm soát tính vô hiệu của các mục trong 
danh sách thông qua tùy chọn nullable: items (cho `[Item]!`) hoặc nullable: itemsAndList (cho `[Item]`). 
Xin lưu ý rằng `nullableByDefault: true` tùy chọn cài đặt cũng sẽ áp dụng cho các danh sách, 
vì vậy nó sẽ tạo ra loại `[Item]`, giống như với nullable: itemsAndList.

Đối với các danh sách lồng nhau, 
các tùy chọn đó áp dụng cho toàn bộ chiều sâu của mảng: `@Field(() => [[Item]]` 
sẽ do defaut sản xuất `[[Item!]!]!`, cài đặt `nullable: itemsAndList` sẽ tạo `[[Item]]` 
trong khi `nullable: items` sẽ tạo ra `[[Item]]!`

trong đối tượng cấu hình, chúng tôi cũng có thể cung cấp các 
thuộc tính `description` và `deprecationReason` cho các mục đích lược đồ GraphQL.

Vì vậy, sau những thay đổi này, lớp mẫu của chúng ta sẽ trông như thế này:

```ts
@ObjectType({ description: "The recipe model" })
class Recipe {
  @Field(type => ID)
  id: string;

  @Field({ description: "The title of the recipe" })
  title: string;

  @Field(type => [Rate])
  ratings: Rate[];

  @Field({ nullable: true })
  averageRating?: number;
}
```

Điều này sẽ dẫn đến việc tạo ra phần sau của lược đồ GraphQL trong SDL:
```graphql
type Recipe {
  id: ID!
  title: String!
  ratings: [Rate!]!
  averageRating: Float
}
```

Tương tự, class type `Rate` sẽ như thế này:
```ts
@ObjectType()
class Rate {
  @Field(type => Int)
  value: number;

  user: User;
}
```

dẫn đến kết quả tương đương với GraphQL SDL:
```graphql
type Rate {
  value: Int!
}
```

Như chúng ta có thể thấy, đối với `id` tài sản của `Recipe` chúng tôi đã thông qua `type => ID`
và cho field `value` của `Rate` chúng tôi đã thông qua `type => Int`. 
Bằng cách này, chúng ta có thể ghi đè loại được suy ra từ siêu dữ liệu phản chiếu. 
Chúng ta có thể đọc thêm về `ID` và `Int` vô hướng trong tài liệu vô hướng. 

Ngoài ra `user` tài sản không có trang trí `@Field()` - 
theo cách này chúng ta có thể ẩn một số thuộc tính của mô hình dữ liệu của mình. 
Trong trường hợp này, chúng tôi cần lưu trữ trường `user` của đối tượng `Rate` 
vào cơ sở dữ liệu để ngăn chặn nhiều mức giá, 
nhưng chúng tôi không muốn làm cho nó có thể truy cập công khai.

Lưu ý rằng nếu một trường thuộc loại đối tượng hoàn toàn có thể tính toán được 
(ví dụ `averageRating` từ mảng `ratings`) và chúng tôi không muốn làm ô nhiễm class signature, 
chúng tôi có thể bỏ qua nó và chỉ thực hiện trình phân giải trường (được mô tả trong [resolvers doc](resolvers) ).