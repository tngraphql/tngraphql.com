---
permalink: guides/http/routing
category: The Basics
---

# Routing

- Các Route Mutation, Query là gì?.
- Cách xác định các tuyến theo nguyên tắc.

## Các Route Mutation, Query là gì?.

Nếu bạn chưa biết về GraphQL bạn có thể tìm hiểu thêm [tại đây](https://graphql.org/learn/queries/)

Người dùng sẽ sử dụng các tên query, mutation của bạn để truy vấn dữ liệu.
Để làm cho các query, mutation này hoạt động bạn phải xác định chúng là **query,mutation**
bên trong `start/route.ts`

Hãy bắt đầu bằng các xác định các query.

[codegroup]

```ts{}{start/query.ts}
import { Route } from 'tn-illuminate/dist/Support/Facades';

Route.get('exampleQuery', 'ExapmleResolve.exampleQuery');
```

```ts{}{app/Resolves/ExapmleResolve.ts}
import { Query, Resolver } from 'tn-graphql';
import {UserType} from '../Types/UserType'

@Resolver()
class ExapmleResolve {
  @Query(returns => UserType)
  async exampleQuery(): UserType {
    return {
        id: 1,
        name: 'nguyen'
    };
  }
}
```

```ts{}{app/Types/UserType.ts}
import { Field, ObjectType } from 'tn-graphql';

@ObjectType('user')
export class UserType {
    @Field()
    id: number

    @Field()
    name: string
}
```

[/codegroup]

[note]
Đảm bảo khởi động máy chủ HTTP bằng cách chạy `ts-node-dev src/index.ts` lệnh.
[/note]

Ví dụ ở trên đăng ký trả về `query` sau

```graphql
query exapmle {
    exampleQuery {
        id
        name
    }
}
```

## CRUD Actions

Nguyên tắc CRUD chúng tôi khuyến nghị sử dụng tên một cách minh xác.

Ví dụ: query `posts` sử dụng để **xem tất cả bài đăng** và `createPost` để **tạo mới bài đăng**

```ts
// danh sách bài đăng
Route.query('posts', 'PostResolve.list');

// tạo mới một bài đăng
Route.mutation('createPost', 'PostResolve.create');
```

Đây là ví dụ các query, mutation để thực hiện các thao tác CRUD trên các bài đăng trên blog

```ts
// tạo mới bài viết
Route.mutation('createPost', 'PostResolve.create');

// danh sách bài viết
Route.query('posts', 'PostResolve.list');

// đọc một bài viết
Route.query('post', 'PostResolve.index');

// cập nhật một bài viết
Route.mutation('createUpdate', 'PostResolve.update');

// xóa bài viết
Route.mutation('createDelete', 'PostResolve.delete');
```

TNGraphQL cung cấp một lối tắt để xác định sử dụng tất cả các routes **Route resources**.

### Route resources

```ts
Route.resource('post', 'PostsResolve')
```

Phương thức `Route.resource` đăng ký các query, mutation sau.

```ts
Route.mutation('createPost', 'PostResolve.create');
Route.query('posts', 'PostResolve.list');
Route.query('post', 'PostResolve.index');
Route.mutation('createUpdate', 'PostResolve.update');
Route.mutation('createDelete', 'PostResolve.delete');
```

Tuy nhiên, khi tạo máy chủ GraphQL, các query,mutation để hiển thị biểu mẫu
là dự phòng và có thể được xóa bằng `except/only` phương thức.

### Filtering Resourceful Routes

Trong nhiều tình huống,
bạn sẽ muốn ngăn một số `query,mutation` được đăng ký. 
Ví dụ: Bạn đã quyết định hạn chế người dùng blog của bạn cập 
nhật hoặc xóa nhận xét của họ và do đó các tuyến đường cho cùng là không bắt buộc.

```ts
Route
  .resource('comment', 'CommentsResolve')
  .except(['update', 'destroy']) 👈
```

Ngược lại phương pháp `except` là `only` để danh sách trắng chỉ chọn các `query,mutation` đã chọn.

```ts
Route
  .resource('comment', 'CommentsResolve')
  .only(['index', 'create', 'store', 'show', 'edit']) 👈
```

Các phương thức `except` và `only` đưa một mảng các tập hợp con của `(query, mutation) name` vào
danh sách đen hoặc danh sách trắng. Khi cả hai được áp dụng cùng nhau,
`only` phương pháp sẽ giành chiến thắng.

## Route Groups

TNGraphQL cung cấp một cách tuyệt vời để nhóm nhiều tuyến có tính chất tương tự và định
cấu hình hàng loạt chúng thay vì xác định lại các thuộc tính giống nhau trên mỗi tuyến.

Một nhóm được tạo bằng cách chuyển một bao đóng cho `Route.group` phương thức.
Các tuyến đường, được khai báo bên trong việc đóng cửa là một phần của nhóm xung quanh.

```ts
Route.group(() => {
  // Tất cả tuyến đường ở đây là một phần của nhóm
})
```

Bạn cũng có thể tạo các nhóm lồng nhau và
TNGraphQL sẽ hợp nhất hoặc ghi đè các thuộc tính dựa trên hành
vi của cài đặt được áp dụng.

## Route Middleware

Middleware cung cấp API để thực thi một loạt các hành động
trước khi yêu cầu `resolve` cụ thể đến `routes`.

TNGraphQL cung cấp hai lớp mà tại đó phần mềm trung gian có thể được thực thi.

- **Global middleware** được thực thi cho mọi yêu cầu `mutation, query`.
- **Route middleware** được thực thi khi nhận được yêu cầu cho `route` tương ứng.

[note]
Phần này tập trung vào việc sử dụng `Middleware` với route.
Hãy chắc chắn đọc [hướng dẫn dành riêng cho `middleware`](middleware) để tìm hiểu thêm về chúng.
[/note]

Bạn có thể thêm middleware vào các tuyến bằng `middleware` phương thức này,
như được hiển thị bên dưới:

```ts
Route
  .query('user', 'UsersResolve.index')
  .middleware(async (data: ResolverData, next: () => Promise<void>) => {
    console.log(`Inside middleware ${data.info.parentType.name}`)
    await next()
  })
```

### Middleware Classes

Giống như Resolves,
bạn có thể trích xuất các chức năng middleware functions vào các lớp
chuyên dụng của riêng chúng và giữ cho tệp tuyến đường của bạn sạch sẽ và gọn gàng.

Tạo và sử dụng middleware class bao gồm một bước bổ sung đăng ký bí danh middleware và
sau đó aliases làm định danh trên tuyến.
Các [hướng dẫn middleware](middleware) bao gồm các khái niệm về aliases chi tiết.

1. Chạy lệnh sau để tạo middleware class mới.

   ```sh
   ts-node ace make:middleware Sample
   ```

2. Sao chép và dán nội dung sau `app/GraphQL/Middleware/Sample.ts` file.

   ```ts
   import { ResolverData } from '@tngraphql/graphql';
   
   export class Sample {
       public async handle (
           data: ResolverData,
           next: () => Promise<void>
       ) {
           console.log(`Inside middleware ${data.info.parentType.name}`)
           await next()
       }
   }
   ```
   
3. Đăng ký middleware namespace với một bí danh trong `app/GraphQL/kernel.ts` file.
  ```ts
  import { Service } from '@tngraphql/illuminate';
  import { GraphQLKernel } from '@tngraphql/illuminate/dist/Foundation';
  import { Sample } from './Middleware/Sample';
  
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
      protected routeMiddleware = {
          sample: Sample 👈
      }
  }
  ```
  
4. Sử dụng bí danh đã đăng ký trên route.
  ```ts
  Route
    .query('user', 'UsersResolve.index')
    .middleware('sample') 👈
  ```
   
### Sử dụng Middleware cho các Route Groups

Bạn cũng có thể áp dụng middleware cho route groups.
Middleware group sẽ được thực thi trước khi middleware được đăng ký trên các route riêng lẻ.

```ts
Route
 .group(() => {
    Route
        .muation('postUpdate', 'PostsResolve.update')
        .middleware('postAuthor')
 })
 .middleware('auth')
```
Trong ví dụ trên, `auth` middleware sẽ thực thi trước `postAuthor` middleware.

### Sử dụng Middleware cho các Route Resources

Các phương thức `Route.resource` cũng cho thấy nhiều query/mutation để đăng ký middleware
trên tất cả các tuyến đường hoặc chọn đăng ký bởi một `resource` nhất định.

```ts
Route
  .resource('users', 'UsersResolve')
  .middleware('auth')
```
Khi chọn lọc áp dụng middleware cho các tuyến nhất định, 
**khóa đối tượng là tên của route** và **giá trị là một mảng của middleware** để áp dụng.

```ts
Route
  .resource('posts', 'PostsResolve')
  .middleware({
    update: ['auth'],
    delete: ['auth'],
  })
```