---
permalink: guides/database/pagination
category: Database
---

# Pagination

Phân trang của TNGraphQL có cũng cấp thuận tiện để phân trang được tích hợp với `query builder` và `Lucid`.

## Phân trang kết quả từ Query Builder

**forPage(page, [limit=20])**
```ts
const users = await Database
  .from('users')
  .forPage(1, 10)
```

**paginate(page, [limit=20])**
```ts
const results = await Database
  .from('users')
  .paginate(2, 10)
```

[note]
Đầu ra của phương thức `forPage` khác với của phương thức `paginate` .
[/note]

```json
{
  total: '',
  perPage: '',
  lastPage: '',
  page: '',
  data: [{...}]
}
```

Đây là đầu ra của phương thức `paginate`.
```json
SimplePaginator {
  rows: [
    Post {
     // ...
    },
    Post {
     // ...
    },
  ],
  totalNumber: '50',
  perPage: 10,
  currentPage: 1,
  qs: {},
  url: '/',
  firstPage: 1,
  isEmpty: false,
  total: 50,
  hasTotal: true,
  lastPage: 5,
  hasMorePages: true,
  hasPages: true
}
```

- Các phương thức `paginate` chấp nhận hai tham số. Số `page` và `limit` bản ghi cần tìm nạp.

[note]
Nếu sử dụng **PostgreSQL**, `total` sẽ là một chuỗi vì JavaScript không thể xử lý `bigint`
[/note]

## Phân trang kết quả từ Lucid

Bạn cũng có thể phân trang từ Model. Trong ví dụ này, chúng ta sẽ phân trang model User với 15 items trong một trang.
Như bạn thấy, cú pháp gần như giống hệt với phân trang kết quả từ query builder:

```ts
await Post.query().paginate(2, 10)
```

Bạn cũng có thể sử dụng `forPage` khi phân trang với Lucid:
```ts
await Post.query().forPage(1, 10)
```