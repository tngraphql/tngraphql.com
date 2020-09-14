---
permalink: guides/orm/models
category: Lucid ORM
group: Database
---

# Getting Started


## Giới thiệu

Luid ORM đi kèm với TNGraphQL cung cấp một API ActiveRecord đơn giản và tuyệt vời khi làm việc với database.
Mỗi database table sẽ có một "Model" tương ứng để tương tác với table đó.
Model cho phép bạn query dữ liệu trong table, cũng như chèn thêm các dữ liệu mới.

Trước khi bắt đầu, hãy đảm bảo cấu hình kết nối database trong file `config/database.ts`.
Để biết thêm thông tin chi tiết cho cấu hình database,
hãy xem [the documentation](../database/setup).


## Tạo mô hình đầu tiên của bạn

Giả sử bạn đã có [thiết lập](../database/setup), hãy chạy lệnh sau để tạo mô hình dữ liệu đầu tiên của bạn.

```ts
ts-node ace make:model User
```

Các lệnh `make:model` tạo ra một model bên trong mới thư mục `app` với các nội dung sau bên trong nó.

```ts
import { DateTime } from 'luxon'
import { column } from '@tngraphql/lucid/build/src/Orm/Decorators';
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class User extends BaseModel {
    static table = 'name'

    @column({ isPrimary: true })
    public id: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    public static $columns: Pick<User, 'id' | 'createdAt' | 'updatedAt'>
}
```

- Mọi mô hình đều phải extends lớp `BaseModel`.

- Các thuộc tính sử dụng trình trang trí `@column` là tên cột của bảng.
Chúng được định nghĩa như `camelCase` bên trong mô hình và `snake_case` bên trong bảng,
nhưng cũng có thể được tùy chỉnh.

```ts
export default class User extends BaseModel {
  @column({ isPrimary: true, columnName: 'user_id' })
  public id: number
}
```

- Khi sử dụng mô hình dữ liệu, bạn có thể mã hóa hành động định dạng ngày tháng trong mô hình so với việc viết hành động đó ở mọi nơi bạn tìm nạp và người dùng trả lại.

```ts
class User extends BaseModel {
  @column.date({
    serialize: (value) => value.toFormat('dd LLL yyyy')
  })
  public dob: DateTime
}
```

- Bạn cũng có thể sét giá trị thuộc tính mặc định cho một số thuộc tính của mô hình.

```ts
export default class User extends BaseModel {
  @column({ defaultValue: false })
  public delayed: number
}
```

## Lấy nhiều Models

Khi bạn đã tạo được một model và [its associated database table](../database/migrations),
bạn có thể sẵn sàng truy xuất dữ liệu từ database.
Hãy coi mỗi Lucid model như một [query builder](../database/query-builder) mạnh mẽ cho phép bạn thực hiện query tới database một cách liền mạch. Ví dụ:

```ts
const users = await User.query()
for(const user of users) {
    console.log(user);
}
```

**Thêm ràng buộc bổ sung**

Các query mặc định sẽ trả về tất cả kết quả trong database của Model.

Vì mỗi Lucid model phục vụ như một [query builder](../database/query-builder), nên bạn có thể tạo ràng buộc cho các query:

```ts
const users = await User.query()
        .orderBy('name', 'desc')
        .limit(10)
```

[note]
Vì các Lucid model là các query builder,
bạn nên xem qua tất cả các hàm có thể sử dụng trên [query builder](../database/query-builder).
Bạn có thể áp dụng bất kì hàm nào trong này với Lucid query.
[/note]

## Lấy một Model

Ngoài việc lấy tất cả dữ liệu,
bạn có thể lấy một kết quả sử dụng hàm find hoặc first.
Thay vì trả về một mảng model, những hàm này trả về một model instance:

```ts
const user = await User.find(1)

const user = await User.first()

const user = await User.query().where('active', 1).first()
```

**Not Found Exceptions**

Sẽ có lúc bạn muốn bắn ra một exception nếu một model không được tìm thấy.
Điều này thực sự hữu ích khi làm việc trên `resolver`.
Hàm `findOrFail` và `firstOrFail` sẽ trả lại kết quả đầu tiên của `query`. Tuy nhiên, nếu không có kết quả, thì
một `Exception` sẽ được ném ra.

```ts
const user = await User.findOrFail(1)

const user = await User.query().where('active', 1).firstOrFail()
```

## Thêm và cập nhật Models

### Thêm

Bạn có thể chèn các hàng mới vào cơ sở dữ liệu bằng cách sử dụng phương thức `Model.create`
hoặc bằng cách gán thuộc tính cho cá thể mô hình. Ví dụ:

```ts
const user = new User()
user.username = 'virk'
user.email = 'virk@adonisjs.com'

await user.save()
console.log(user.$isPersisted) // true
```

- Các phương thức `user.save` sẽ thực hiện các truy vấn chèn.
- Cờ `user.$isPersisted` sẽ thành `true` khi các giá trị đã được tồn cơ sở dữ liệu.

Một tùy chọn khác là sử dụng phương thức `create` trên chính lớp Model.

```ts
const user = await User.create({
  username: 'virk',
  email: 'virk@adonisjs.com',
})
console.log(user.$isPersisted) // true
```

### Cập nhật

Cách tiêu chuẩn để thực hiện cập nhật bằng cách sử dụng model là trước tiên phải tra cứu bản ghi và sau đó cập nhật/duy trì nó vào cơ sở dữ liệu.

```ts
const user = await User.findOrFail(1)
user.last_login_at = DateTime.local() // Luxon dateTime is used

await user.save()
```

#### Tại sao không sử dụng truy vấn cập nhật trực tiếp

Một cách khác để cập nhật bản ghi là thực hiện cập nhật theo cách thủ công bằng cách sử dụng `query builder`. Ví dụ:

```ts
await User.query().where('id', 1).update({ last_login_at: new Date() })
```

Khi sử dụng cách tiếp cận trên, bạn sẽ bỏ lỡ models niceties.

- Bạn sẽ không thể sử dụng API hooks.
- Bạn không thể sử dụng những `DateTime` người trợ giúp luxon .
- Các `updated_at` cột sẽ không được cập nhật, trừ khi bạn cập nhật nó hoặc sử dụng một kích hoạt mức cơ sở dữ liệu.

Chúng tôi khuyên bạn không nên nhấn mạnh nhiều vào truy vấn `select` bổ sung trừ khi bạn đang xử lý hàng triệu bản cập nhật mỗi giây và vui vẻ rời khỏi các tính năng của mô hình.

## Xóa Model

Tương tự như `update` thao tác, để xóa một model, trước tiên bạn tìm nạp nó từ cơ sở dữ liệu. Ví dụ

```ts
const user = await User.findOrFail(1)
await user.delete()
```

Một lần nữa, để hook hoạt động, Lucid cần thể hiện của mô hình trước. Nếu bạn quyết định sử dụng trực tiếp `query builder`, thì không có hook nào được kích hoạt.

Tuy nhiên, phương pháp tiếp cận `query builder` trực tiếp có thể hữu ích để thực hiện xóa hàng loạt.

```ts
await User.query().where('is_verified', false).delete()
```

### Xóa mềm

Ngoài việc thực sự xóa các bản ghi khỏi cơ sở dữ liệu của bạn,
Lucid cũng có thể thực hiện các mô hình "xóa mềm".
Khi các mô hình bị xóa mềm, chúng không thực sự bị xóa khỏi cơ sở dữ liệu của bạn.
Thay vào đó, một `deleted_at` thuộc tính được đặt trên mô hình và được chèn vào cơ sở dữ liệu.
Nếu một mô hình có `deleted_at` giá trị khác rỗng,
mô hình đó đã bị xóa mềm.

```ts
import { DateTime } from 'luxon'
import { column } from '@tngraphql/lucid/build/src/Orm/Decorators';
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { SoftDeletes } from '@tngraphql/lucid/build/src/Orm/SoftDeletes';

export default class User extends BaseModel {
    @column.dateTime()
    public deletedAt: DateTime

    static boot() {
        this.uses([SoftDeletes])
    }
}
```

Bạn cũng nên thêm `deleted_at` cột vào bảng cơ sở dữ liệu của mình.

```ts
public async up()
{
     this.schema.createTable(this.$tableName, (table) => {
        table.timestamp('deleted_at').nullable()
     })
}
```

Bây giờ, khi bạn gọi phương thức `delete` trên mô hình,
`deleted_at` cột sẽ được đặt thành ngày và giờ hiện tại.
Và, khi truy vấn một mô hình sử dụng tính năng xóa mềm,
các mô hình đã xóa mềm sẽ tự động bị loại trừ khỏi tất cả các kết quả truy vấn.


Để xác định xem một phiên bản mô hình nhất định đã bị xóa mềm hay chưa, hãy sử dụng phương thức `trashed`:
```ts
if (user.trashed()) {
    //
}
```

### Truy vấn các mô hình đã xóa mềm

**Bao gồm các mô hình đã xóa mềm**
Như đã lưu ý ở trên, các mô hình đã xóa mềm sẽ tự động bị loại trừ khỏi kết quả truy vấn.
Tuy nhiên, bạn có thể buộc các mô hình đã xóa mềm xuất hiện trong tập kết quả bằng hàm `withTrashed` trên truy vấn:

```ts
await User.query().withTrashed().where('account_id', 1)
```

Hàm `withTrashed` cũng có thể được sử dụng trên một mối quan hệ truy vấn:

```ts
await user.related('history').query().withTrashed();
```

**Chỉ truy xuất các mô hình đã xóa mềm**
Hàm `onlyTrashed` sẽ chỉ lấy các soft delete model:

```ts
await User.query().onlyTrashed().where('account_id', 1)
```

**Khôi phục các mô hình đã xóa mềm**

Thi thoảng bạn cũng muốn "khôi phục" một soft deleted model. 
Để khôi phục lại một soft delete model về trạng thái active, 
hãy sử dụng hàm `restore` trong một model instance:

```ts
await user.restore()
```

**Xoá các model vĩnh viễn**

Bạn có thể cần thực xoá một model khỏi database. Để xoá vĩnh viễn một soft delete model, hãy sử dụng hàm `forceDelete`:

```ts
// xóa vĩnh viễn một model
await user.forceDelete()

// Xóa vĩnh viễn tất cả mối quan hệ
await user.related('history').query().forceDelete()
```

## Query Scopes

### Global Scopes

Global scope cho phép bạn thêm các constraint vào tất cả các truy vấn cho một model.
Hàm soft delete của TNGraphQL thực hiện trên global scope chỉ với các model "chưa bị xoá" trong database.
Viết global scope riêng của bạn có thể tạo một cách dễ dàng để đảm bảo mỗi truy vấn cho một model nhận đúng constraint.

#### Viết Global Scopes

Viết một global scope khá đơn giản. Tạo một class triển khai từ interface `ScopeContract`.
Interface này yêu cầu bạn viết mã cho một hàm: `apply`. Hàm `apply` có thể nhận constraint `where` vào query khi cần thiết:

```ts
import { ScopeContract } from '@tngraphql/lucid/build/src/Contracts/Model/ScopeContract';
import { ModelQueryBuilderContract } from '@tngraphql/lucid/build/src/Contracts/Model/ModelQueryBuilderContract';
import { LucidModel } from '@tngraphql/lucid/build/src/Contracts/Model/LucidModel';

export class AgeScope implements ScopeContract {
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param builder
     * @param model
     */
    apply(builder: ModelQueryBuilderContract<LucidModel>, model: LucidModel): void {
        builder.where('age', '>', 200);
    }
}
```

[note]
Không có thư mục định sẵn để lưu các scope trong TN-GraphQL,
bạn hoàn toàn thoải mái tạo `Scopes` folder trong thư mục ứng dụng `app`.
[/note]

#### Áp dụng Global Scopes

Để gán một global scope cho một model, bạn cần ghi đè lại hàm `boot` và sử dụng hàm `addGlobalScope`:

```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class User extends BaseModel {

    static boot() {
        super.boot()
        this.addGlobalScope(new AgeScope)
    }
}
```

Sau khi thêm vào scope, một truy vấn `User.query()` sẽ tạo ra câu SQL như sau:

```sql
select * from `users` where `age` > 200
```

#### Các global scope vô danh
Lucid cũng cho phép bạn tạo các global scope sử dụng Closure,
điều này khá hữu ích cho các scope đơn giản mà không cần tạo class riêng:

```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class User extends BaseModel {

    static boot() {
        super.boot()
        this.addGlobalScope('age', builder => {
            builder.where('age', '>', 200)
        })
    }
}
```

Tham số đầu tiên truyền vào `addGlobalScope()` là identifier để loại bỏ `scope` khi cần thiết:

```ts
await User.withoutGlobalScope('age')
```

#### Xóa các Global Scopes

Nếu bạn muốn bỏ một global scope cho một câu truy vấn, bạn có thể sử dụng hàm `withoutGlobalScope`.
Hàm này nhận một tên class của global scope là đối số duy nhất:

```ts
User.withoutGlobalScope(AgeScope)

// or

User.query().withoutGlobalScope(AgeScope)
```

Nếu bạn muốn bỏ một vài hoặc tất cả các global scope, bạn có thể dùng hàm `withoutGlobalScopes`:

```ts
// Remove all of the global scopes...
User.withoutGlobalScopes()

// or

User.query().withoutGlobalScopes()

// Remove some of the global scopes...

User.query().withoutGlobalScopes([FirstScope, SecondScope])
```

### Local Scopes

Local scope cho phép bạn tạo tập hợp các ràng buộc thường dùng mà bạn có thể tái sử dụng trong chương trình.
Ví dụ, bạn có thể hay lấy tất cả các "popular" users.
Để tạo một `scope`, chỉ cần đặt tiền tố `scope` trong một hàm của Lucid model.

Scope luôn luôn trả về một instance của query builder:
```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class User extends BaseModel {
    /**
    *  Scope a query to only include popular users.
    */
    static scopePopular(query) {
        return query.where('votes', '>', 100)   
    }

    static scopeActive(query) {
        return query.where('active', 1)
    }
}
```

#### Sử dụng một Local Scope

Khi scope được khai báo, bạn có thể sử dụng hàm của scope khi thực hiện query model.
Tuy nhiên, bạn không cần thêm vào tiền tố scope khi gọi hàm. Bạn ngoài ra có thể gọi móc nối các scope liên tiếp:

```ts
const user = await User.query().active().popular().orderBy('createdAt')
```

#### Scopes động

Thỉnh thoảng cần muốn định nghĩa một scope có nhận tham số.
Để bắt đầu, thêm các tham số vào scope. Tham số của Scope sẽ được định nghĩa sau tham số `query`:

```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class User extends BaseModel {

    static scopeOfType(query, type) {
        return query.where('type', type)
    }
}
```

Bây giờ, bạn có thể truyền vào tham số khi gọi scope:

```ts
const user = await User.query().ofType('admin')
```

## Hooks

Hook là các hành động mà bạn có thể thực hiện trong một sự kiện vòng đời được xác định trước.

Sử dụng hook, bạn có thể đóng gói các hành động nhất định trong các mô hình của mình so với việc viết chúng ở mọi nơi bên trong code base.

Một ví dụ tuyệt vời về hook là băm mật khẩu.
Thay vì băm mật khẩu người dùng ở khắp mọi nơi bên trong cơ sở mã của bạn,
bạn có thể viết nó dưới dạng hook và đảm bảo rằng mật khẩu người dùng sẽ được duy trì dưới dạng văn bản thuần túy.

### Tạo hook đầu tiên của bạn

Cho phép xây dựng trên ví dụ băm mật khẩu và xác định một móc để băm mật khẩu người dùng trước khi lưu nó vào cơ sở dữ liệu.

```ts
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.hash(user.password)
    }
  }
}
```

- Các hook `beforeSave` được gọi trước truy vấn `insert` và `update`.

- Các hook có thể không đồng bộ. Vì vậy, bạn có thể sử dụng `await` từ khóa bên trong chúng.

- Hook luôn được định nghĩa là hàm tĩnh và nhận thể hiện của mô hình làm đối số đầu tiên.

#### Tìm hiểu `$dirty`

Các hook `beforeSave` được gọi mỗi khi một người dùng mới được **tạo ra** hoặc **cập nhật** bằng cách sử dụng model instance.

Trong quá trình cập nhật, có thể bạn đã cập nhật các thuộc tính khác chứ không phải mật khẩu người dùng, do đó không cần phải băm lại băm hiện có và đây là lý do đằng sau việc sử dụng đối tượng `$dirty`.

Đối tượng `$dirty` chỉ chứa các giá trị đã thay đổi.
Vì vậy, bạn có thể kiểm tra xem mật khẩu đã được thay đổi hay chưa và sau đó băm giá trị mới.

### Hook có sẵn

Sau đây là danh sách các hook có sẵn. Mỗi hook đi kèm với một `before` và `after` biến thể.

| Hook | Mô tả |
|-------|------------|
| `beforeSave` | Được gọi **trước khi thêm mới hoặc cập nhật**. Nhận model instance làm đối số duy nhất. |
| `afterSave` | Được gọi **sau khi thêm mới hoặc cập nhật** . Nhận model instance làm đối số duy nhất.|
| `beforeCreate` | Chỉ được gọi **trước truy vấn chèn**. Nhận model instance làm đối số duy nhất.|
| `afterCreate` | Chỉ được gọi **sau truy vấn chèn**. Nhận model instance làm đối số duy nhất.|
| `beforeUpdate` | Chỉ được gọi **trước khi truy vấn cập nhật**. Nhận model instance làm đối số duy nhất.|
| `afterUpdate` | Chỉ được gọi **sau khi truy vấn cập nhật**. Nhận model instance làm đối số duy nhất.|
| `beforeDelete` | Được gọi **trước khi truy vấn xóa**. Nhận model instance làm đối số duy nhất.|
| `afterDelete` | Được gọi **sau truy vấn xóa**. Nhận model instance làm đối số duy nhất.|

#### Example

Import the required decorators.
```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { 
  beforeSave,
  afterSave,
  beforeCreate,
  afterCreate,
  beforeUpdate,
  afterUpdate,
  beforeDelete,
  afterDelete,
 } from '@tngraphql/lucid/build/src/Orm/Decorators';
```

Tạo các phương thức tĩnh và sử dụng trình trang trí thích hợp

```ts
export default class User extends BaseModel {
  @beforeSave()
  public static async hashPassword (user: User) {
  }

  @beforeDelete()
  public static async handleSoftDeletion (user: User) {
  }

  @afterUpdate()
  public static async createChangeRevision (user: User) {
  }
}
```

#### beforeFind

Các hook `beforeFind` được gọi ngay trước khi truy vấn được thực hiện để một phát hiện một hàng duy nhất.
Hook này nhận thể hiện trình tạo truy vấn và bạn có thể đính kèm các ràng buộc của riêng mình vào nó.

```ts
export default class User extends BaseModel {
  @beforeFind()
  public static ignoreDeleted (query: ModelQueryBuilderContract<typeof User>) {
    query.whereNull('is_deleted')
  }
}
```

#### afterFind

Sự kiện `afterFind` nhận được model instance.

```ts
export default class User extends BaseModel {
  @afterFind()
  public static afterFindHook (user: User) {
  }
}
```

#### beforeFetch

Tương tự như `beforeFind`, hook `beforeFetch` cũng nhận được thể hiện của trình tạo truy vấn.
Tuy nhiên, hook này được gọi bất cứ khi nào một truy vấn được thực thi mà không sử dụng  phương thức `first`.

#### afterFetch

Các hook `afterFetch` nhận được một array of model instances.

```ts
export default class User extends BaseModel {
  @afterFetch()
  public static afterFetchHook (users: User[]) {
  }
}
```