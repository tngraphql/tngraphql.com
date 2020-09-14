---
permalink: guides/database/query-builder
category: Database
---

# Query Builder

Trình tạo query builder là bước đầu tiên hướng tới việc xây dựng và thực thi các truy vấn SQL.
Thay vì viết SQL bằng tay, bạn sử dụng API Javascript để xây dựng các truy vấn.

Đến cuối hướng dẫn này, bạn sẽ biết:

- Cách tạo và thực thi truy vấn SQL
- Sử dụng các loại trình tạo truy vấn khác nhau để thực hiện các truy vấn insert, select hoặc raw queries

## Using the Query Builder

Bạn có thể lấy một phiên bản của trình tạo truy vấn bằng cách sử dụng Database module. Ví dụ:

```ts
import { Database } from "@tngraphql/illuminate/dist/Support/Facades";

const users = await Database.query().select('*').from('users')
```

- Các phương thức `Database.query` tạo ra một truy vấn mới.

- Các phương thức `select` được sử dụng để chọn các cột.

- Cuối cùng, phương thức `from` chỉ định bảng cơ sở dữ liệu cho truy vấn.

- Kết quả của truy vấn luôn là một mảng các đối tượng, trừ khi phương thức `.first` được sử dụng.

Cũng giống như `select` và các phương thức `from`,
có nhiều phương thức khác trên trình tạo truy vấn để tạo các truy vấn SQL phức tạp và nâng cao.

## Types of Query Builders
Các phương thức `Database.query` tạo ra một truy vấn cho **selecting**, **updating** hoặc **deleting**.
Trong khi, để insert dữ liệu mới, bạn phải sử dụng `insert query builder`.

Sau đây là danh sách các trường hợp `query builders` khác nhau.

- Query builder selecting, updating hoặc deleting.

  ```ts
  Database.query().from('users')
  
  // Shortcut
  Database.from('users')
  
  // select
  Database.from('users').select('id', 'username')
  
  // update
  Database.from('users').where('id', 1).update({username: 'nguyen'})
  ```
- Query builder for inserting new rows.
  ```ts
  Database.insertQuery().table('users')

  // Shortcut
  Database.table('users')
  ```
- Raw query builder for executing raw SQL queries. You will learn about raw queries later in this guide.
  ```ts
  Database.rawQuery('select * from users;')
  ```
  
  
## Fetching Rows

Khi thực hiện truy vấn bằng `Database query` kết quả truy vấn luôn được trả về là một mảng đối tượng,
ngay cả khi chỉ có một kết quả được trả về từ cơ sở dữ liệu.

```ts
const users = await Database.query().select('*').from('users')
// an array of users
```

Nếu bạn luôn muốn một hàng duy nhất từ ​​tập kết quả, thì bạn có thể sử dụng phương thức `first`.

[note]
Các phương thức `first` áp dụng `LIMIT 1` để truy vấn.
[/note]

```ts
const user = await Database.query().select('*').from('users').first()
```

## Selects
### Chỉ định một mệnh đề select
Tất nhiên, bạn có thể không phải lúc nào cũng muốn lấy toàn bộ các cột từ một bảng.
Sử dụng phương thức `select` bạn có thể chỉ định tùy chọn một mệnh đề `select` cho truy vấn:
```ts
await Database.select('id', 'username').from('users')
// or
await Database.select('*').from('users')
```

```sql{}{SQL Output}
select `id`, `username` from `users`
select * from `users`
```

Phương thức `distinct` cho phép bạn bắt buộc truy vấn trả về các kết quả phân biệt:
```ts
await Database.distinct().from('users')
```

Bạn có thể tạo bí danh cho truy vấn như sau:
```ts
await Database.select('username as uname').from('users')
```

Nếu bạn đã có sẵn một query builder instance và bạn muốn thêm một cột vào mệnh đề select,
bạn có thể tiếp tục sử dụng phương thức select:
```ts
const query = Database.select('name').from('users')
await query.select('age')
```

## Where Clauses

**Query Builder** cung cấp nhiều phương thức động để thêm mệnh đề **where**.

Nó cũng hỗ trợ các truy vấn con bằng cách sử dụng `closure` hoặc một truy vấn khác thay vì giá trị thực.

Để biết `where` thông tin chi tiết , hãy xem [tài liệu](http://knexjs.org/#Builder-wheres) của Knex .

[note]
Việc `where` chuyển vào tham số `undefined` sẽ gây ra lỗi trong quá trình biên dịch SQL,
vì vậy hãy đảm bảo các giá trị động không có `undefined` trước khi chuyển chúng.
[/note]

**where**
```ts
await Database.from('users').where('id', 1)
// Or
await Database.from('users').where({ id: 1 })
```

Bạn có thể chuyển toán tử so sánh vào mệnh đề `where` như sau:
```ts
await Database.from('users').where('votes', '=', 100)

await Database.from('users').where('votes', '>=', 100)

await Database.from('users').where('votes', '<>', 100)

await Database.from('users').where('name', 'like', 'T%')
```

**where (with callback)**

Bạn có thể truyền một lệnh callback tới mệnh đề `where` để nhóm tất cả các mệnh đề có bên trong `callback`:
```ts
await Database.from('users').where(function (query) {
  query
    .where('id', 1)
    .orWhere('id', '>', 10)
})
```

## Inserts

Query builder cung cấp phương thức `insert` để chèn các bản ghi vào trong bảng.
Ví dụ:

```ts
await Database
  .insertQuery() // 👈 gives an instance of insert query builder
  .table('users')
  .insert({ username: 'foo', email: 'foo@gmail.com' })
```

Giá trị trả về của `insert` phụ thuộc vào máy chủ cơ sở dữ liệu đang sử dụng.

- MySQL và SQLite sẽ trả về id hàng được chèn cuối cùng dưới dạng một mảng chỉ có một mục. Ví dụ:

```ts
const [ lastInsertId ] = await Database.table('users').insert({})
```

- Đối với PostgreSQL, MSSQL và Oracle, bạn có thể sử dụng phương thức `returning`.
Phương thức trả về có thể trả về giá trị cho một cột hoặc nhiều cột. Ví dụ:

```ts
const [ id ] = await Database
  .table('users')
  .returning('id') 👈
  .insert({})

// multiple columns
const [{ username, id }] = await Database
  .table('users')
  .returning(['id', 'username']) 👈
  .insert({})
```

Bạn có thể chèn nhiều bản ghi riêng biệt vào bảng với một lần gọi `insert` bằng cách
truyền vào một mảng, muỗi đối tượng con sẽ đại diện cho một dòng được chèn vào bảng.

[note]
MySQL và SQLite chỉ trả về id cho hàng cuối cùng chứ không phải tất cả các hàng.
[/note]

```ts
await Database.table('users').insert([
  { username: 'virk' },
  { username: 'romain' },
])
```

## updates
Tất nhiên,
ngoài việc chèn thêm bản ghi vào database,
query builder cũng có thể cập nhật bản ghi có sẵn bằng cách sử dụng phương thức `update`.
Bạn có thể ràng buộc truy vấn `update` sử dụng mệnh đề `where`:

```ts
await Database
  .from('users')
  .where('id', '1')
  .update({ votes: 1 })
```
## Increment & Decrement

Query builder cũng cung cấp các phương thức thuận tiện cho việc tăng hay giảm giá trị của một cột.
Đây chỉ đơn giản là một short-cut, cung cấp một interface nhanh chóng và ngắn gọn so với việc viết cú pháp `update`.

Cả hai phương thức trên đều chấp nhận ít nhất 1 tham số: cột để thay đổi.
Một tham số thứ 2 có thể tùy chọn được truyền vào để điều khiển giá trị tăng hay giảm cho cột:
```ts
await Database.from('users').increment('votes')

await Database.from('users').increment('votes', 1)

await Database.from('users').decrement('votes')

await Database.from('users').decrement('votes', 1)
```

## Deletes

Để xóa các bản ghi từ bảng chúng ta sử dụng phương thức `delete`.
Bạn có thể ràng buộc cú pháp `delete` bằng cách thêm mệnh đề `where` trước khi gọi phương thức `delete`:

```ts
await Database.from('posts').delete()

await Database
  .from('posts')
  .where('slug', 'dummy-post')
  .delete()
```

## Raw Expressions

Đôi khi bạn có thể cần sử dụng một biểu thức trong truy vấn.
Những expression này sẽ được đưa vào truy vấn như các chuỗi,
vì vậy hãy cẩn thận đừng tạo bất kì lỗi SQL injection nào. Để tạo một raw expression,
bạn có thể sử dụng phương thức `rawQuery`

[note]
Không giống như phản hồi của trình tạo truy vấn chuẩn,
phản hồi của `rawQuery` không được chuẩn hóa.
Bạn phải đọc tài liệu về trình điều khiển `npm` cơ bản để biết.
[/note]

```ts
const user = await Database
  .rawQuery('select * from users where id = ?', [1]);
```

- Phương thức `rawQuery` chấp nhận 2 tham số.

- Tham số đầu tiên là truy vấn SQL.

- Tham số thứ 2 là mảng các giá trị để thay thế `?` bên trong SQL.
Để ngăn chặn SQL injection,
bạn phải luôn xác định các giá trị dưới dạng các ràng buộc và không nội dòng chúng bên trong chuỗi SQL. Ví dụ:

```ts{}{Prone to SQL injection}
Database.rawQuery('select * from users where id = 1')
```

```ts{}{An toàn trước SQL injection}
Database.rawQuery('select * from users where id = ?', [1])
```

## Aggregates

Query builder cũng cung cấp một tập hợp các phương thức khác nhau,
như là `count`, `max`, `min`, `avg`, và `sum`.
Chúng trả về một mảng các giá trị của nó. Ví dụ:

```ts
const total = await Database.query().count('*').from('users')

// SQLITE: [{ "count(*)": 4 }]
// POSTGRESQL: [{ "count": "4" }]
```

Như bạn có thể nhận thấy, đầu ra của `PostgreSQL` và `SQLite` khác nhau và do đó không thể đoán trước được.
Để gặp phải hành vi này, bạn nên luôn đặt bí danh cho các tập hợp của mình.

```ts
await Database.query().count('* as total').from('users')

// SQLITE: [{ "total": 4 }]
// POSTGRESQL: [{ "total": "4" }]
```

## Joins

### Inner Join Clause

Query builder cũng có thể được sử dụng để viết các cú pháp join.
Để thực hiện một "inner join" SQL đơn giản, bạn có thể sử dụng phương thức `join` cho một query builder instance.
Tham số được truyền vào đầu tiên trong phương thức `join` là tên của bảng bạn join đến,
trong khi tham số còn lại chỉ định các cột ràng buộc cho việc join.
Tất nhiên như bạn có thể thấy, bạn có thể join nhiều bảng trong một truy vấn:

```ts
await Database.query().from('users')
    .join('contacts', 'users.id', '=', 'contacts.user_id')
    .join('orders', 'users.id', '=', 'orders.user_id')
    .select('users.*', 'contacts.phone', 'orders.price')
```

### Left Join Clause

Nếu bạn thích thực hiện một "left join" thay vì "inner join",
sử dụng phương thức `leftJoin`. Phương thức `leftJoin` này có cú pháp giống phương thức `join`:

```ts
await Database.query().from('users')
    .leftJoin('posts', 'users.id', '=', 'posts.user_id')
```

### Cross Join Clause

Để thực hiện một "cross join", sử dụng phương thức `crossJoin` với tên của bảng bạn muốn cross join đến.
Cross join sinh ra một cartesion product giữa bảng đầu tiên và bảng bị join.

```ts
await Database.query().from('sizes').crossJoin('colours')
```

### Advanced Join Clauses

Bạn cũng có thể chỉ định nhiều mệnh đề `join` nâng cao.
Để bắt đầu, truyền một `Closure` như là tham số thứ 2 vào phương thức `join`.
`Closure` sẽ nhận một đối tượng `JoinClause` cái mà cho phép bạn chỉ định các ràng buộc trong mệnh đề `join`:

```ts
await Database.query().from('users')
    .join('contacts', join => {
        join.on('users.id', '=', 'contacts.user_id')->orOn(...);
    })
```

### union
Query builder cũng cung cấp một cách nhanh chóng để "union" 2 truy vấn với nhau.
Ví dụ:

```ts
await Database.query().from('users')
    .whereNull('last_name')
    .union(builder => builder.from('users').whereNull('first_name'))
```

```ts
await Database.query().from('users')
    .whereNull('last_name')
    .union([
        builder => builder.from('users').whereNull('first_name'),
        builder => builder.from('users').whereNull('email')
    ])
```

[note]
Phương thức `unionAll` cũng có và có cách sử dụng như `union`.
[/note]
