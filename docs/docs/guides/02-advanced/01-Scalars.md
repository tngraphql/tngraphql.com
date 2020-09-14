---
permalink: guides/scalars
category: Advanced guides
---

# Scalars

Sử dụng các scalar có sẵn của graphql khi khai báo các loại trường.
```ts
import { GraphQLFloat, GraphQLID, GraphQLInt } from 'graphql';

@ObjectType()
class MysteryObject {
  @Field(type => GraphQLID)
  readonly id: string;

  @Field(type => GraphQLInt)
  notificationsCount: number;

  @Field(type => GraphQLFloat)
  probability: number;
}
```

Trong trường hợp cuối cùng `type => GraphQLFloat` bạn có thể bỏ qua và javascript `Number` sẽ tự động
trở thành lược đồ GraphQLFloat

Các Scalar khác - GraphQLString và GraphQLBoolean khi có thể chúng có thể phản ảnh một cách tự động

```ts
@ObjectType()
class User {
  @Field()
  name: string;

  @Field()
  isOld: boolean;
}
```

Tuy nhiên trong một số trường hợp chúng ta phải khai báo một cách rõ ràng `string/bool` scalar type.
Sử dụng các hàm (GraphQLString, GraphQLBoolean)
```ts
@ObjectType()
class SampleObject {
  @Field(type => GraphQLString, { nullable: true })
  // TS reflected type is `Object` :(
  get optionalInfo(): string | undefined {
    if (Math.random() > 0.5) {
      return "Gotcha!";
    }
  }
}
```

## Custom Scalars

TNGraphQL cũng hỗ trợ các kiểu vô hướng tùy chỉnh!

Trước hết, chúng ta cần tạo `GraphQLScalarType` cá thể của riêng mình hoặc nhập scalar type
từ thư viện npm của bên thứ ba. Ví dụ: `ObjectId` của `Mongo`:

```ts
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";

export const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "Mongo object id scalar type",
  parseValue(value: string) {
    return new ObjectId(value); // value from the client input variables
  },
  serialize(value: ObjectId) {
    return value.toHexString(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // value from the client query
    }
    return null;
  },
});
```

Sau đó, chúng tôi chỉ có thể sử dụng nó trong trang trí `@Field` của chúng tôi:
```ts
import { ObjectIdScalar } from "../my-scalars/ObjectId";

@ObjectType()
class User {
  @Field(type => ObjectIdScalar) // and explicitly use it
  readonly id: ObjectId;

  @Field()
  name: string;

  @Field()
  isOld: boolean;
}
```

Tùy chọn, chúng tôi có thể khai báo liên kết giữa loại thuộc tính được phản ánh và 
vô hướng của chúng tôi để tự động ánh xạ chúng (không cần chú thích loại rõ ràng!):

```ts
@ObjectType()
class User {
  @Field() // magic goes here - no type annotation for custom scalar
  readonly id: ObjectId;
}
```

Tất cả những gì chúng ta cần làm là đăng ký bản đồ liên kết trong `kernel` tùy chọn:

```ts
import { Service } from '@tngraphql/illuminate';
import { GraphQLKernel } from '@tngraphql/illuminate/dist/Foundation';
import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./scalars/ObjectId";

@Service()
export class Kernel extends GraphQLKernel {
    /**
     * global middleware
     */
    protected middleware = [
    ];

    /**
     * Register name middleware
     */
    protected routeMiddleware = {}
    
    protected scalarsMap = {
        [{ type: ObjectId, scalar: ObjectIdScalar }],
    }
}
```

[note]
lưu ý rằng điều này sẽ chỉ hoạt động khi cơ chế phản chiếu TypeScript có thể xử lý nó.
Vì vậy, loại tài sản lớp của chúng ta phải là một class, không phải là enum, union hoặc interface.
[/note]