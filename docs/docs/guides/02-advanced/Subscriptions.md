---
permalink: guides/subscriptions
category: Advanced guides
---

# Subscriptions

GraphQL có thể được sử dụng để thực hiện đọc với các queries và viết với các mutations.
Tuy nhiên, khách hàng thường muốn nhận được các bản cập nhật từ máy chủ khi dữ 
liệu họ quan tâm về các thay đổi. 
Để hỗ trợ điều đó, GraphQL có một hoạt động thứ ba: subscription. 
Tất nhiên, TNGraphQL hỗ trợ rất nhiều cho việc subscription,
sử dụng gói [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions)
 được tạo bởi [Apollo GraphQL](https://www.apollographql.com/).

## Tạo Subscriptions

Subscriptions tương tự như bộ giải quyết query và mutation nhưng phức tạp hơn một chút.

Đầu tiên chúng ta tạo một phương thức lớp bình thường như mọi khi,
nhưng lần này được chú thích với trình trang trí `@Subscription()`.

```ts
class SampleResolver {
  // ...
  @Subscription()
  newNotification(): Notification {
    // ...
  }
}
```

Sau đó, chúng tôi phải cung cấp các chủ đề chúng tôi muốn đăng ký.
Đây có thể là một chuỗi chủ đề duy nhất, một mảng các chủ đề hoặc một chức 
năng để tự động tạo một chủ đề dựa trên các đối số đăng ký được truyền cho truy vấn. 
Chúng tôi cũng có thể sử dụng `enums TypeScript` để tăng cường an toàn.

```ts
class SampleResolver {
  // ...
  @Subscription({
    topics: "NOTIFICATIONS", // single topic
    topics: ["NOTIFICATIONS", "ERRORS"] // or topics array
    topics: ({ args, payload, context }) => args.topic // or dynamic topic function
  })
  newNotification(): Notification {
    // ...
  }
}
```

Chúng tôi cũng có thể cung cấp `filter` tùy chọn để quyết định những sự kiện chủ đề nào sẽ 
kích hoạt subscription của chúng tôi. Hàm này sẽ trả về một` boolean` hoặc Promise<boolean>.

```ts
class SampleResolver {
  // ...
  @Subscription({
    topics: "NOTIFICATIONS",
    filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  newNotification(): Notification {
    // ...
  }
}
```

Chúng tôi cũng có thể cung cấp logic subscription tùy chỉnh có thể hữu ích,
ví dụ: nếu chúng tôi muốn sử dụng chức năng Prisma subscription hoặc một cái gì đó tương tự.

Tất cả những gì chúng ta cần làm là sử dụng `subscribe` tùy chọn sẽ là một hàm trả về một `AsyncIterator`. 
Ví dụ sử dụng tính năng Prisma client subscription:
```ts
class SampleResolver {
  // ...
  @Subscription({
    subscribe: ({ args, context }) => {
      return context.prisma.$subscribe.users({ mutation_in: [args.mutationType] });
    },
  })
  newNotification(): Notification {
    // ...
  }
}
```

[note]
Xin lưu ý rằng chúng tôi không thể trộn `subscribe` tùy chọn với `topics` và `filter` tùy chọn.
Nếu vẫn cần `filter`, chúng ta có thể sử dụng hàm `withFilter` từ package `graphql-subscriptions`.
[/note]

Bây giờ chúng ta có thể thực hiện subscription resolver. 
Nó sẽ nhận được trọng tải từ một chủ đề được kích hoạt của hệ thống `pubsub` 
bằng cách sử dụng trang trí `@Root()`. Ở đó, chúng ta có thể biến đổi nó thành hình dạng trả về.

```ts
class SampleResolver {
  // ...
  @Subscription({
    topics: "NOTIFICATIONS",
    filter: ({ payload, args }) => args.priorities.includes(payload.priority),
  })
  newNotification(
    @Root() notificationPayload: NotificationPayload,
    @Args() args: NewNotificationsArgs,
  ): Notification {
    return {
      ...notificationPayload,
      date: new Date(),
    };
  }
}
```

## Kích hoạt subscription topics

Ok, chúng tôi đã tạo subscriptions, nhưng `pubsub` hệ thống là gì và làm thế nào để chúng tôi kích hoạt các 
chủ đề?

Chúng có thể được kích hoạt từ các nguồn bên ngoài như cơ sở dữ liệu nhưng cũng có thể bị đột biến, 
ví dụ như khi chúng tôi sửa đổi một số tài nguyên mà khách hàng muốn nhận thông báo về khi thay đổi.

Vì vậy, chúng ta hãy giả sử rằng chúng ta có mutation này để thêm một nhận xét mới:

```ts
class SampleResolver {
  // ...
  @Mutation(returns => Boolean)
  async addNewComment(@Arg("comment") input: CommentInput) {
    const comment = this.commentsService.createNew(input);
    await this.commentsRepository.save(comment);
    return true;
  }
}
```

Chúng tôi sử dụng trang trí `@PubSub()` để tiêm `pubsub` vào các thông số phương thức của chúng tôi. 
Ở đó chúng tôi có thể kích hoạt các chủ đề và gửi tải trọng cho tất cả những người đăng ký chủ đề.

```ts
class SampleResolver {
  // ...
  @Mutation(returns => Boolean)
  async addNewComment(@Arg("comment") input: CommentInput, @PubSub() pubSub: PubSubEngine) {
    const comment = this.commentsService.createNew(input);
    await this.commentsRepository.save(comment);
    // here we can trigger subscriptions topics
    const payload: NotificationPayload = { message: input.content };
    await pubSub.publish("NOTIFICATIONS", payload);
    return true;
  }
}
```

Để dễ kiểm tra hơn (mocking / stubbing), chúng ta cũng có thể tự tiêm phương thức `publish` 
này vào một chủ đề đã chọn. 
Điều này được thực hiện bằng cách sử dụng trang trí `@PubSub("TOPIC_NAME")` và type `Publisher<TPayload>`:

```ts
class SampleResolver {
  // ...
  @Mutation(returns => Boolean)
  async addNewComment(
    @Arg("comment") input: CommentInput,
    @PubSub("NOTIFICATIONS") publish: Publisher<NotificationPayload>,
  ) {
    const comment = this.commentsService.createNew(input);
    await this.commentsRepository.save(comment);
    // here we can trigger subscriptions topics
    await publish({ message: input.content });
    return true;
  }
}
```

Và đó là nó! Bây giờ tất cả các đăng ký được đính kèm với `NOTIFICATIONS` chủ đề sẽ được kích hoạt khi 
thực hiện `addNewComment` đột biến.

## Sử dụng hệ thống PubSub tùy chỉnh

Theo mặc định, TNGraphQL sử dụng một `PubSub` hệ thống đơn giản `grapqhl-subscriptions` dựa trên EventEuctor. 
Giải pháp này có một nhược điểm lớn là nó sẽ chỉ hoạt động chính xác khi chúng ta có một phiên bản (quy trình) duy nhất của ứng dụng Node.js.

Để có khả năng mở rộng tốt hơn, chúng tôi sẽ muốn sử dụng một trong những [PubSub implementations](https://github.com/apollographql/graphql-subscriptions#pubsub-implementations) 
được hỗ trợ bởi một store bên ngoài như Redis với package [graphql-redis-subscriptions](https://github.com/davidyaha/graphql-redis-subscriptions).

Tất cả những gì chúng ta cần làm là tạo một phiên bản `PubSub` theo hướng dẫn và sau đó 
cung cấp nó cho các kernel TNGraphQL :

```ts
const myRedisPubSub = getConfiguredRedisPubSub();

@Service()
export class Kernel extends GraphQLKernel {
    /**
     * global middleware
     */
    protected middleware = [];

    /**
     * Register name middleware
     */
    protected routeMiddleware = {}

    protected pubSub = myRedisPubSub;
}
```

### Tạo một Subscription Server



