---
permalink: guides/database/transactions
category: Database
---

# Transactions

Bạn có thể sử dụng phương thức `transaction` trong `Database` facade để chạy một set các hoạt động trong một database transaction.
Nếu có một exception được ném ra trong transaction `Closure`,
transaction sẽ tự động được rolled back.
nếu `Closure` thực thi thành công, transaction sẽ tự động được committed.
Bạn không cần phải lo lắng về việc thực hiện thủ công các thao tác roll back hay commit khi sử dụng hàm transaction:

```ts
await Databse.transaction(async () => {
    await Database.from('users').update({votes: 1})
    await Database.from('posts').delete();
})
```

[note]
Các truy vấn bên trong phương thức `transaction` phải là `async` `await`.
Nếu không có `await` thì truy vấn sẽ bị block ra khỏi transaction.
[/note]

## Thực hiện transaction thủ công

Nếu bạn muốn thực hiện transaction thủ công và muốn quản lý việc rollback và commit,
bạn có thể làm như sau:

```ts
const trx = Databse.transaction();
await trx.from('users').update({votes: 1})
await trx.from('posts').delete()
await trx.commit()
// or
await trx.rollback()
```
## Sử dụng transaction với Lucid Model

Bạn có thể sử dụng transaction tự động với Lucid Model

```ts
await Databse.transaction(async () => {
    await User.query().update({votes: 1})
    await Post.query().where('id', 1).delete();
})

await Databse.transaction(async () => {
    const user = new User()
    user.username = 'nguyen';
    
    await user.save();
})

```

Để tạo transaction thủ công ta phải chuyển giao dịch đến trình tạo truy vấn mô hình.
```ts
const trx = Databse.transaction();

const users = await User
  .query({ client: trx }) 👈
  .where('is_active', true)
```