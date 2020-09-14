---
permalink: guides/enums
category: Advanced guides
---

# Enums

Ngày nay, hầu hết tất cả các ngôn ngữ đánh máy đều hỗ trợ cho các kiểu enum,
bao gồm cả TypeScript. Enums giới hạn phạm vi của các giá trị của biến đối với một tập các hằng số được xác 
định trước, điều này giúp cho việc ghi lại ý định dễ dàng hơn.

GraphQL cũng có hỗ trợ kiểu enum,
vì vậy TNGraphQL cho phép chúng ta sử dụng enum TypeScript trong lược đồ GraphQL.

## Tạo enum

Hãy tạo một `enum` TypeScript.
Nó có thể là một `enum` số hoặc chuỗi - các giá trị bên trong của `enum` được lấy từ các giá trị định nghĩa 
`enum` và tên công khai được lấy từ các khóa `enum`:
```ts
// implicit value 0, 1, 2, 3
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

// or explicit values
enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}
```

Để nói với TNGraphQL về `enum` của chúng tôi,
chúng tôi sẽ đánh dấu các `enum` một cách lý tưởng với trình trang trí `@GraphQLEnumType()`.
Tuy nhiên, các trình trang trí TypeScript chỉ hoạt động với các class, 
vì vậy chúng ta cần làm cho TNGraphQL nhận biết thủ công bằng cách gọi hàm `registerEnumType` 
và cung cấp tên `enum` cho GraphQL:

```ts
import { registerEnumType } from '@tngraphql/graphql';

registerEnumType(Direction, {
  name: "Direction", // this one is mandatory
  description: "The basic directions", // this one is optional
});
```

## Sử dụng enum

Bước cuối cùng rất quan trọng: `TypeScript` có khả năng phản chiếu hạn chế, 
vì vậy đây là trường hợp chúng ta phải cung cấp rõ ràng loại `enum` cho các trường loại đối tượng, 
trường loại đầu vào, đối số và loại trả về của `query` và `mutation`:

```ts
@InputType()
class JourneyInput {
  @Field(type => Direction) // it's very important
  direction: Direction;
}
```

Nếu không có chú thích này, loại GQL được tạo sẽ là `String` hoặc `Float`(tùy thuộc vào loại `enum`), 
thay vì loại `ENUM` chúng tôi đang hướng tới.

Với tất cả những thứ đó, chúng ta có thể sử dụng `enum` trực tiếp trong mã của mình

```ts
@Resolver()
class SpriteResolver {
  private sprite = getMarioSprite();

  @Mutation()
  move(@Arg("direction", type => Direction) direction: Direction): boolean {
    switch (direction) {
      case Direction.Up:
        this.sprite.position.y++;
        break;
      case Direction.Down:
        this.sprite.position.y--;
        break;
      case Direction.Left:
        this.sprite.position.x--;
        break;
      case Direction.Right:
        this.sprite.position.x++;
        break;
      default:
        // it will never be hitten ;)
        return false;
    }

    return true;
  }
}
```

## Khả năng tương tác

`Enums` trong TNGraphQL được thiết kế dành cho phía máy chủ - bộ thực thi sẽ ánh xạ giá trị chuỗi 
từ đầu vào thành giá trị `enum` tương ứng, như "UP" vào 0. 
Mặc dù điều này rất tiện lợi, ví dụ như để ánh xạ các giá trị cơ sở dữ liệu vào các tên `enum` API của GraphQL, 
nó làm cho nó không thể sử dụng được ở phía truy vấn vì
`Direction.UP` sẽ đặt 0 vào truy vấn là giá trị không hợp lệ (nên là UP).

Vì vậy, nếu chúng tôi muốn chia sẻ định nghĩa loại và sử dụng `enum` trên ứng dụng phía máy khách 
hoặc sử dụng `enum` trực tiếp trên ứng dụng máy chủ, ví dụ như trong các thử nghiệm, 
chúng tôi phải sử dụng ánh xạ trực tiếp của tên thành viên `enum` với các giá trị cụ thể, ví dụ:

```ts
enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
```