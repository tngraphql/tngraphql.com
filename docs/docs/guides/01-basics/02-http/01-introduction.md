---
permalink: guides/http/introduction
category: The Basics
---

# Giới thiệu

TN-GraphQL là một `graphql framework` cung cấp nhiều công cụ phát triển API GraphQL trong nodejs với typescript.

Bạn đã sử dụng framework laravel, bạn có thể đã quen với một số thuật ngữ nhất định.
Nếu không, việc hiểu mọi phần của khung có thể mất một lúc, nhưng không sao.

## Router Query và Mutation
Query là điểm khởi đầu cho ứng dụng của bạn.
Bạn cần xác định Query cho trang web của mình và nếu không đăng ký bất kỳ query nào,
ứng dụng của bạn sẽ bị lỗi.

Bạn có thể đăng ký các query bằng Routes module của TN_GraphQL như trong ví dụ sau:

[note]
Query/Mutation được đăng ký trong file `start/route.ts`
Bạn có thể thay đổi chúng trong `RouteServiceProvider.ts` ở thư mục `Providers`
[/note]

```ts{}{start/query.ts}
import { Route } from 'tn-illuminate/dist/Support/Facades';

Route.query('user', 'ExampleResolve.user');
```

[Tìm hiểu thêm](routing) về routes

## Resolves

TNGraphQL cho phép chúng ta dễ dàng tạo các query, mutation như các phương thức lớp bình thường.


Chúng tôi sử dụng định tuyến Router để xác định các query, mutation
Ví dụ:

[codegroup]

```ts{}{Route}
import { Route } from 'tn-illuminate/dist/Support/Facades';

Route.query('recipes', 'RecipeResolver.recipes');
```

```ts{}{Resolves}
import { Query, Resolver } from 'tn-graphql';
import {Recipe} from '../Types'

@Resolver()
class RecipeResolver {
  private recipesCollection: Recipe[] = [];

  @Query(returns => [Recipe])
  async recipes() {
    return await this.recipesCollection;
  }
}
```

```ts{}{Type}
import { Field, ObjectType } from 'tn-graphql';

@ObjectType('user')
export class Recipe {
    @Field()
    id: number

    @Field()
    name: string
}
```

[/codegroup]

[Tìm hiểu thêm](resolves) về resolves

## Models

Model đại diện cho lớp cơ sở dữ liệu của ứng dụng của bạn.
TN-GraphQL đã hỗ trợ sẵn cho các mô hình dữ liệu được xây dựng dựa trên [Active Record pattern](https://en.wikipedia.org/wiki/Active_record_pattern).
Bạn có thể mô tả các bảng cơ sở dữ liệu của mình dưới dạng các lớp JavaScript và sử dụng các phương thức JavaScript để đọc, viết và xóa các hàng.
Ví dụ:

[codegroup]

```ts{}{Declaring a Model}
import { column } from 'tn-lucid/build/src/Orm/Decorators';
import { BaseModel } from 'tn-lucid/build/src/Orm/BaseModel';

class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string
}
```

```ts{}{Using Models}
import User from 'App/Models/User'

await User.all() // fetch all
await User.find(1) // find where id = 1

await User.query().where('age', '>', 18) // find where age > 18

// Creating new user
const user = new User()
user.username = 'virk'
user.email = 'virk@gmail.com'

await user.save()
```

[/codegroup]

Cùng với Model, TN-GraphQL cũng cung cấp cho bạn API [database migrations](),
[seeders]() và khả năng xây dựng và thực hiện các truy vấn bằng [Database query builder]().

## Middleware

Middleware là một thuật ngữ được thiết lập được sử dụng bởi nhiều khung trên nhiều ngôn ngữ lập trình.

Trong TN-GraphQL, middleware được thực thi trước khi yêu cầu đến route. Middleware có thể thực hiện các nhiệm vụ khác nhau có tính chất khác nhau. Ví dụ:

- Thực hiện yêu cầu xác thực và hủy bỏ khi người dùng chưa đăng nhập.
- Tải trước dữ liệu bằng Mô hình.
- Thực hiện giám sát sử dụng bằng cách theo dõi mọi yêu cầu HTTP.

```ts
import { ResolverData } from 'tn-graphql';

export class Acl {
    public async handle (
        ({context}): ResolverData,
        next: () => Promise<void>
    ) {
        if(!context.user) {
            throw new Error('Unauthorized');
        }
        await next()
    }
}
```

[Tìm hiểu thêm](middleware) về middleware.

## Tóm lược

Trong hướng dẫn này, bạn đã tìm hiểu ngắn gọn về các khái niệm và thuật ngữ được sử dụng bởi TN-GraphQL.
Toàn bộ khung xoay quanh các khái niệm tương tự và do đó quen thuộc với chúng là rất quan trọng.

Trong các hướng dẫn sắp tới, bạn sẽ tìm hiểu về các thuật ngữ và khái niệm tương tự sâu hơn cùng với các trường hợp sử dụng thực tế của chúng.
