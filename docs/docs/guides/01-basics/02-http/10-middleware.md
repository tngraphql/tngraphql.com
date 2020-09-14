---
permalink: guides/http/middleware
category: The Basics
---

# Middleware
Middleware là các đoạn mã có thể tái sử dụng có thể dễ dàng gắn vào resolvers and fields.
Bằng cách sử dụng middleware,
chúng tôi có thể trích xuất mã được sử dụng từ resolvers của mình và sau đó đính kèm một
cách khai báo bằng cách sử dụng trình trang trí hoặc thậm chí đăng ký nó trên toàn cầu.

## Creating Middleware
### Middleware là gì?

Phần mềm trung gian là một tính năng rất mạnh nhưng hơi phức tạp. Về cơ bản, middleware là một hàm có 2 đối số:

- resolver dữ liệu - giống như resolvers ( root, args, context, info)
- các next function - được sử dụng để kiểm soát việc thực hiện các middleware tiếp theo và giải quyết mà nó được gắn liền

Chúng ta có thể quen thuộc với cách thức hoạt động của phần mềm trung gian `express.js`
nhưng phần mềm trung gian `TNGraphQL` được lấy cảm hứng từ `koa.js`.
Sự khác biệt là hàm `next` trả về một lời hứa về giá trị của việc thực thi phần mềm trung gian và trình phân giải tiếp theo từ ngăn xếp.

Điều này giúp bạn dễ dàng thực hiện các hành động trước hoặc sau khi thực thi trình phân giải.
Vì vậy, những thứ như đo thời gian thực hiện rất đơn giản để thực hiện:
```ts
import { ResolverData, MiddlewareInterface } from '@tngraphql/graphql';

export class ResolveTime implements MiddlewareInterface {
   public async handle (
       data: ResolverData,
       next: () => Promise<void>
   ) {
       const start = Date.now();
       await next();
       const resolveTime = Date.now() - start;
       console.log(`${info.parentType.name}.${info.fieldName} [${resolveTime} ms]`);
   }
}
```

### Chặn kết quả thực thi
Phần mềm trung gian cũng có khả năng chặn kết quả thực thi của resolvers.
Nó không chỉ có thể tạo một nhật ký mà còn có thể thay thế kết quả bằng một giá trị mới:

```ts
import { ResolverData, MiddlewareInterface } from '@tngraphql/graphql';

export class CompetitorInterceptor implements MiddlewareInterface {
   public async handle (
       data: ResolverData,
       next: () => Promise<void>
   ) {
       const result = await next();
       if (result === "typegql") {
           return "tn-graphql";
       }
       return result;
   }
}
```
Nó có vẻ không hữu ích lắm từ quan điểm của người dùng thư viện này nhưng tính năng này chủ yếu được giới thiệu cho các hệ thống `plugin` và tích hợp thư viện bên thứ ba.
Nhờ đó, có thể ví dụ như bọc đối tượng được trả về bằng một trình bao bọc quan hệ lười biếng để tự động tìm nạp các quan hệ từ cơ sở dữ liệu theo yêu cầu.

### Simple Middleware
Nếu chúng ta chỉ muốn làm điều gì đó trước một hành động,
chẳng hạn như log lại quyền truy cập vào resolver, chúng ta chỉ cần đặt câu lệnh `return next()` ở cuối middleware của mình:

```ts
const LogAccess: MiddlewareFn<{username: string}> = ({ context, info }, next) => {
  const username: string = context.username || "guest";
  console.log(`Logging access: ${username} -> ${info.parentType.name}.${info.fieldName}`);
  return next();
};
```

### Middleware tái sử dụng

Đôi khi middleware phải có thể định cấu hình,
Trong trường hợp này, chúng ta nên tạo một middleware factory đơn giản - middleware này lấy cấu hình là `params` (tham số) và `return middleware` sử dụng giá trị được cung cấp.

VD:
```ts
export function NumberInterceptor(minValue: number): MiddlewareFn {
    return async (_, next) => {
        const result = await next();
        // hide values below minValue
        if (typeof result === "number" && result < minValue) {
          return null;
        }
        return result;
    };
}
```
Hãy nhớ gọi `middleware` này với một `argument` (đối số), VD: NumberInterceptor(3.0), khi gắn nó vào `resolver`!


### Error Interceptors

Middleware cũng có thể bắt các lỗi được phát ra trong quá trình thực thi.
Bằng cách này, chúng có thể dễ dàng được ghi lại và thậm chí được lọc để tìm thông tin không thể trả lại cho người dùng:

```ts
import { ResolverData, MiddlewareInterface } from '@tngraphql/graphql';

export class ErrorInterceptor implements MiddlewareInterface {
   public async handle (
       { context, info }: ResolverData,
       next: () => Promise<void>
   ) {
       try {
           return await next();
       } catch (err) {
           // write error to file log
           fileLog.write(err, context, info);
       
           // hide errors from db like printing sql query
           if (someCondition(err)) {
             throw new Error("Unknown error occurred!");
           }
       
           // rethrow the error
           throw err;
       }
   }
}
```

### Class-based Middleware

Các middleware được viết dựa trên `class` có thể sử dụng tiêm phụ thuộc
 `dependency injection` và dễ dàng giả lập trình ghi tệp hoặc kho lưu trữ cơ sở dữ liệu.

```ts
export class ErrorInterceptor implements MiddlewareInterface {
   constructor(private readonly logger: Logger) {}

   public async handle (
       { context, info }: ResolverData,
       next: () => Promise<void>
   ) {
       const username: string = context.username || "guest";
       this.logger.log(`Logging access: ${username} -> ${info.parentType.name}.${info.fieldName}`);
       return next();
   }
}
```

## Cách sử dụng

### Attaching Middleware
Để đính kèm middleware vào resolver,
hãy đặt trình trang trí `@UseMiddleware()` phía trên field `Resolver` được khai báo.
Nó chấp nhận một mảng middleware và được gọi theo thứ tự được cung cấp.
Chúng ta cũng có thể truyền chúng dưới dạng [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters):

```ts
@Resolver()
export class RecipeResolver {
  @Query()
  @UseMiddleware(ResolveTime, LogAccess)
  randomValue(): number {
    return Math.random();
  }
}
```

Chúng ta cũng có thể đính kèm phần mềm trung gian vào các field `ObjectType`.
```ts
@ObjectType()
export class Recipe {
  @Field()
  title: string;

  @Field(type => [Int])
  @UseMiddleware(LogAccess)
  ratings: number[];
}
```

### Global Middleware

Tuy nhiên, đối với middleware phổ biến như đo thời gian giải quyết hoặc bắt lỗi,
việc đặt `@UseMiddleware(ResolveTime)` trên mọi field / resolver có thể gây khó chịu.

Do đó, trong TNGraphQL chúng ta có thể đăng ký một global middleware sẽ được gọi cho muỗi query, mutation, subscription
và field resover. Đối với điều này chúng tôi đăng ký middleware bên trong tệp `src/app/GraphQL/Kernel.ts`.
```ts
@Service()
export class Kernel extends GraphQLKernel {
    /**
     * global middleware
     */
    protected middleware = [
        ErrorInterceptor,
        ResolveTime
    ];
    // ...
}
```

### Route Middleware

Route middleware hoạt động như các middleware được đính kèm vào `resolver`.


Một điểm tuyệt vời là middleware kiểm soát truy cập, mà bạn chỉ muốn áp dụng trên một tập hợp các query, mutation, subscription.

Để làm điều này, trước tiên ta cần đăng ký nó.

1. Chạy lệnh sau để tạo một phần mềm trung gian mới

    ```ts
    ts-node ace make:middleware Acl
    ```

2. Mở tệp phần mềm trung gian mới được tạo và dán nội dung sau vào tệp.

    ```ts
    import { ResolverData } from '@tngraphql/graphql';
    
    export class Acl {
        public app;
    
        public async handle(
            data: ResolverData,
            next: () => Promise<void>,
            allowedRoles: string[],
        ) {
            console.log(`enforces "${ allowedRoles }" roles`)
            await next()
        }
    }
    ```

3. Khóa đối tượng sẽ là tên mà sau này chúng ta tham chiếu trên `route` và giá trị chính là `middleware` của chúng ta.
    
   ```ts
    @Service()
    export class Kernel extends GraphQLKernel {
        /**
         * Register name middleware
         */
        protected routeMiddleware = {
            acl: Acl
        }
        // code
    }
    ```

4. Sau đó chúng ta có thể sử dụng chúng ở `route`.

    ```ts
    Route.query('users', 'UserResolve.list').middleware('acl:user,moderator');
    ```

Ngoài ra chúng cũng có thể sử dụng đính kèm trên các field `Resolver` và `ObjectType`.

```ts
@Resolver()
export class UserResolver {
  @Query()
  @UseMiddleware('acl:user,moderator')
  list(): number {
    return Math.random();
  }
}
```

#### Làm thế nào chúng hoạt động

- Một `route middleware` phải được đăng ký trong file `Kernel.ts` và sau đó bạn có thể sử dụng ở trên các `route`
và trình trang trí `@UseMiddleware`.
- Khi gọi `Route.middleware`, bạn có thể chuyển các đối số đến phần mềm trung gian bằng cách phân tách chúng bằng biểu thức dấu `:`
- Các đối số được truyền cho `handle` dưới dạng đối số thứ 3.


### Custom Decorators


