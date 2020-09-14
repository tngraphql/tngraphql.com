---
permalink: guides/orm/relationships
category: Lucid ORM
group: Database
---

# Relationship

Các bảng trong cơ sở dữ liệu thường có liên quan tới một bảng khác.
Ví dụ một blog có thể có nhiều comment,
hay một đơn hàng sẽ phải có thông tin liên quan của người dùng mà đã đặt nó.
Lucid giúp cho quản lý và làm việc với những quan hệ này một cách đơn giản và hỗ trợ nhiều kiểu quan hệ.

- Một - Một
- Một - Nhiều
- Nhiều - Nhiều
- Has Many Through
- Quan hệ đa hình
- Quan hệ đa hình nhiều nhiều

## Xác định mối quan hệ

Hãy bắt đầu bằng cách tạo hai mô hình và sau đó xác định mối quan hệ giữa chúng.
Chúng ta sẽ sử dụng một mối quan hệ `hasOne` trong ví dụ này.
Tuy nhiên, quá trình xác định mối quan hệ là giống nhau đối với mọi loại mối quan hệ khác.

```bash
ts-node ace make:model User
ts-node ace make:model Profile
```

Mô hình User model.

```bash
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { hasOne } from '@tngraphql/lucid/build/src/Orm/Decorators';
import { HasOne } from '@tngraphql/lucid/build/src/Contracts/Orm/Relations/types';
import Profile from './Profile'

export default class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}
```

Mô hình Profile model. Nó phải có một cột khóa ngoại `userId` để mối quan hệ hoạt động.

```ts
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { column } from '@tngraphql/lucid/build/src/Orm/Decorators';

export default class Profile extends BaseModel {
    @column()
    public userId: number
}
```

### Điểm cần lưu ý

- Các `User` model sử dụng trang trí `hasOne` để thiết lập mối quan hệ với các `Profile`.
- Nó cũng sử dụng một type `HasOne` trên thuộc tính `profile`.
Cần phải **phân biệt giữa các mối quan hệ và các thuộc tính mô hình khác** để hỗ trợ `intellisense` tốt hơn.

- Model `Profile` phải có cột khóa phụ `userId`.

Tương tự, bạn có thể sử dụng các kiểu và trình trang trí sau để xác định các mối quan hệ khác.

```ts
import {
    BelongsTo,
    HasOne,
    HasMany,
    ManyToMany,
    HasManyThrough,
    MorphTo,
    MorphOne,
    MorphMany,
    MorphToMany,
    MorphedByMany
} from '@tngraphql/lucid/build/src/Contracts/Orm/Relations/types';
import {
    belongsTo,
    hasOne,
    hasMany,
    manyToMany,
    hasManyThrough,
    morphTo,
    morphOne,
    morphMany,
    morphToMany,
    morphedByMany
} from '@tngraphql/lucid/build/src/Orm/Decorators';

export default class User extends BaseModel {
    @hasOne(() => Profile)
    public profile: HasOne<typeof Profile>

    @belongsTo(() => Team)
    public team: BelongsTo<typeof Team>

    @hasMany(() => Post)
    public posts: HasMany<typeof Post>

    @manyToMany(() => Skill)
    public skills: ManyToMany<typeof Skill>

    @hasManyThrough(() => Project, () => Team)
    public projects: HasManyThrough<typeof Project>
}
```

## Tải trước mối quan hệ

Tải trước (hoặc tải nhanh) là một trong những tác vụ phổ biến nhất mà bạn sẽ thực hiện khi làm việc với các mối quan hệ.
Ví dụ: Tìm nạp tất cả người dùng cùng với hồ sơ của họ.

```ts
const users = await User
  .query()
  .preload('profile') // 👈

users.forEach((user) => console.log(user.profile))
```

Bạn cũng có thể tải các mối quan hệ lười biếng cho một phiên bản mô hình hiện có. Ví dụ:

```ts
// Reference to logged in user
const user = auth.user

// Preload profile for the user
await user.preload('profile')

// Access profile
console.log(user.profile)
```

### Tải trước nhiều quan hệ

Gọi phương `preload` thức nhiều lần để tải trước nhiều mối quan hệ.

```ts
const users = await User
  .query()
  .preload('profile') // preload profile
  .preload('emails') // preload emails

users.forEach((user) => {
  console.log(user.profile)
  console.log(user.emails)
})
```

### Mối quan hệ ràng buộc

Khi tải trước các mối quan hệ, bạn cũng có thể xác định các ràng buộc bằng cách chuyển một lệnh gọi lại làm tham số thứ 2.

Khi tìm nạp dữ liệu liên quan, bạn cũng có thể xác định các ràng buộc đối với trình tạo truy vấn mối quan hệ. Trong ví dụ sau, chỉ những **email đã xác minh** mới được tìm nạp từ cơ sở dữ liệu.

```ts
User.query().preload('emails', (query) => {
  query.where('isVerified', true)
})
```

## Tải trước mối quan hệ lồng nhau

Bạn có thể tải trước các mối quan hệ lồng nhau bằng cách gọi phương thức `preload` trên trình tạo truy vấn mối quan hệ.
Hãy xem xét ví dụ sau.

```ts
const user = auth.user
await user.preload('profile', (query) => {
  query.preload('address')
})

console.log(user.profile)
console.log(user.profile.address)
```

## Quyền truy cập vào trình tạo truy vấn trực tiếp

Bạn không chỉ bị giới hạn trong việc tải trước các mối quan hệ.
Bạn cũng có thể truy cập trực tiếp vào trình tạo truy vấn mối quan hệ như được hiển thị trong ví dụ sau.

[note]
Không giống như tải trước, kết quả truy vấn được trả về trực tiếp và không tồn tại trên phiên bản mô hình mẹ.
[/note]

```ts
const user = await User.find(1)

const activeEmails = user
  .related('emails')
  .query()
  .where('isActive', true)
```

Trình tạo truy vấn tương tự cũng có thể được sử dụng để xóa các hàng liên quan.

```ts
user.related('emails')
  .query()
  .where('isActive', false)
  .delete()
```

## Truy vấn tồn tại mối quan hệ

Lucid đơn giản hóa công việc truy vấn sự tồn tại của mối quan hệ mà không cần viết thủ công các truy vấn nối bằng tay. Hãy xem xét ví dụ sau

```ts
const userWithTeams = await User.query().has('team')
```

Bạn cũng có thể xác định số hàng mà bạn mong đợi truy vấn kết hợp trả về.
Ví dụ: Chọn tất cả người dùng, những người đã đăng ký hơn hai khóa học.

```ts
const veterans = await User.query().has('courses', '>', 2)
```

Hãy tiến thêm một bước nữa và cũng thêm ràng buộc để chọn các khóa học hoàn thành 100%.
Lần này, chúng tôi sẽ sử dụng `whereHas` thay vì `has`.

[tip]
Các phương thức `wherePivot` là chỉ có sẵn cho mối quan hệ `manyToMany` và tiền tố tên bảng `pivot` để ngăn chặn xung đột tên cột.
[/tip]

```ts
const veterans = await User
  .query()
  .whereHas('courses', (query) => {
    query.wherePivot('completion_percentage', 100)
  }, '>', 2)
```

### Các phương pháp tồn tại mối quan hệ khác

Sau đây là danh sách các phương pháp tương tự khác để truy vấn sự tồn tại của mối quan hệ.

- `orHas`: Định nghĩa một `or where exists` mệnh đề.
- `doesntHave`: Đối lập với `has`.
- `orDoesntHave`: Đối lập với `orHas`.


- `orWhereHas`: Định nghĩa một `orWhere` mệnh đề.
- `whereDoesntHave`: Đối lập với `whereHas`.
- `orWhereDoesntHave`: Đối lập với `orWhereHas`.

## Đếm các hàng liên quan

Bạn có thể sử dụng hàm `withCount` này để đếm số hàng liên quan.
Ví dụ: Đếm số lượng bài viết mà người dùng đã viết.

```ts
const users = await User.query().withCount('posts')
```

Bây giờ, bạn có thể truy cập vào số lượng bài viết như hình bên dưới.

```ts
users.forEach((user) => {
  console.log(user.$extras.posts_count)
})
```

Tiếp nữa, bạn cũng có thể xác định các ràng buộc tùy chỉnh cho truy vấn đếm.
Ví dụ: Chỉ đếm số lượng bài đăng được xuất bản mà người dùng đã viết.

```ts
const users = await User.query().withCount('posts', (query) => {
  query.where('isPublished', true)
})
```

### Bí danh số lượng tùy chỉnh

Bạn cũng có thể xác định bí danh tùy chỉnh cho kết quả truy vấn đếm bằng phương pháp `as` này.

```ts
const users = await User.query().withCount('posts as totalPosts')

users.forEach((user) => {
  console.log(user.$extras.totalPosts)
})
```

## On Query Hook

Mỗi khi bạn xác định mối quan hệ,
bạn cũng có thể đính kèm một hook `onQuery` với nó và điều này có thể cho phép bạn tạo các biến thể của mối quan hệ của mình. Ví dụ:

```ts
export default class User extends BaseModel {
  @hasMany(() => UserEmail)
  public emails: HasMany<typeof UserEmail>

  @hasMany(() => UserEmail, {
    onQuery: (query) => query.where('isActive', true)
  })
  public activeEmails: HasMany<typeof UserEmail>
}
```

Như bạn có thể nhận thấy, chúng tôi đã xác định hai mối quan hệ trên cùng một mô hình.
Tuy nhiên, `activeEmails` mối quan hệ này có thêm một `where` ràng buộc để giới hạn kết quả chỉ với những email đang hoạt động.

```ts
await User.query().preload('activeEmails')

// direct access
const user = await User.find(1)
const activeEmails = user.related('activeEmails').query()
```

## Chèn các model liên quan

### Phương thức save

Lucid cung cấp nhiều phương thức tiện lợi cho việc thêm model vào quan hệ.
Ví dụ, Bạn muốn tạo mới người dùng và hồ sơ.
Thay vì thủ công bạn phải tạo người dùng xong set thuộc tính `user_id` cho `profile`,
bạn cho thể chèn trực tiếp từ phương thức `related().save`:

Đây là một ví dụ về cách tạo người dùng và hồ sơ của họ.
```ts
const user = new User()
user.email = 'virk@adonisjs.com'
user.password = 'secret'

const profile = new Profile()
profile.avatarUrl = 'foo.jpg'
profile.isActive = true

await user.related('profile').save(profile)
```

Hàm `related().save` sẽ quấn cả các cuộc gọi chèn bên trong một giao dịch.
Tuy nhiên, bạn cũng có thể xác định một giao dịch tùy chỉnh bằng cách đặt nó trên mô hình mẹ. Ví dụ:

```ts
const user = new User()
user.email = 'nguyenpl117@gmail.com'
user.password = 'secret'

const profile = new Profile()
profile.avatarUrl = 'foo.jpg'
profile.isActive = true

user.$trx = await Database.transaction()

try {
  await user.related('profile').save(profile)
  await user.$trx.commit()
} catch (error) {
  await user.$trx.rollback()
}
```

Khi đối tượng giao dịch được tạo bởi bạn,
thì nội bộ của Lucid sẽ không `commit` hoặc `rollback` giao dịch đó và do đó bạn phải thực hiện.


### Phương thức `create`

Ngoài ra còn có một cách viết tắt để duy trì các mối quan hệ mà không cần tạo một phiên bản của mô hình liên quan.

```ts
const user = new User()
user.email = 'nguyenpl117@gmail.com'
user.password = 'secret'

await user.related('profile').create({
  avatarUrl: 'foo.jpg',
  isActive: true
})
```

Trong ví dụ trên, chúng ta đã thay thế hàm `save` bằng `create`.
Ngoài ra, thay vì truyền một thể hiện của `profile` mô hình, bạn có thể truyền một đối tượng thuần túy cho hàm `create`.


## Tránh trùng lặp trong thời gian tồn tại

Kể từ đó, Lucid sử dụng các hành động cho các mối quan hệ lâu dài.
Bạn có thể sử dụng các phương pháp như `firstOrCreate`, `updateOrCreatev`.v. để tránh tạo các hàng trùng lặp.

### `firstOrCreate`

Tìm kiếm bản ghi bên trong cơ sở dữ liệu và tạo một bản ghi mới khi tra cứu không thành công.
Phương pháp này là một sự lựa chọn hoàn hảo cho những `hasOne` mối quan hệ lâu bền .

[note]
Phương thức này hoạt động tương tự như phương thức `firstOrCreate` của Model.
[/note]

Trong ví dụ sau, hồ sơ sẽ chỉ được tạo nếu nó chưa tồn tại.

```ts
const user = new User()
user.email = 'virk@adonisjs.com'
user.password = 'secret'

const searchPayload = {}
const savePayload = {
  avatarUrl: 'foo.jpg',
  isActive: true,
}

await user.related('profile').firstOrCreate(searchPayload, savePayload)
```

### `updateOrCreate`

Tương tự như `firstOrCreate`, phương thức này cũng cập nhật hàng hiện có, thay vì tìm nạp nó.

```ts
const user = new User()
user.email = 'virk@adonisjs.com'
user.password = 'secret'

const searchPayload = {}
const savePayload = {
  avatarUrl: 'foo.jpg',
  isActive: true,
}

await user.related('profile').updateOrCreate(searchPayload, savePayload)
```

## hasOne
Các `HasOne` mối quan hệ tạo ra một **one-to-one** mối quan hệ giữa hai mô hình.
Một ví dụ tuyệt vời về điều này là một người dùng có một hồ sơ .

```ts
export default class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}
```

Mô hình Hồ sơ phải có một cột khóa ngoại `userId` được xác định trên đó.

```ts
export default class Profile extends BaseModel {
  @column()
  public userId: number
}
```

Theo mặc định, `foreignKey` là biểu diễn `camelCase` của tên **parent model name** và khóa chính của nó.


| Parent Model Name	| Primary Key	| Foreign Key
|-------|------------|------------|
| User | id | userId

Tuy nhiên, bạn cũng có thể xác định khóa ngoại tùy chỉnh.

```ts
@hasOne(() => Profile, {
  foreignKey: 'profileUserId',
})
public profile: HasOne<typeof Profile>
```

`localKey` luôn là khóa chính của **parent model**, nhưng có thể được định nghĩa rõ ràng.

```ts
@hasOne(() => Profile, {
  localKey: 'uuid',
  foreignKey: 'profileUserId',
})
public profile: HasOne<typeof Profile>
```

## belongsTo

`belongsTo` là nghịch đảo của `hasOne` và được áp dụng ở đầu bên kia của mối quan hệ.

```ts
export default class Profile extends BaseModel {
  // Foreign key
  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
```

`User` model chỉ cần `localKey` (khóa chính trong hầu hết các trường hợp).

```ts
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number
}
```

### Custom foreign key

Theo mặc định, `foreignKey` là biểu diễn `camelCase` của tên **related model name** và khóa chính của nó.


| Related Model Name	| Primary Key	| Foreign Key
|-------|------------|------------|
| User | id | userId

Tuy nhiên, bạn cũng có thể xác định `foreignKey` tùy chỉnh.

```ts
@belongsTo(() => User, {
  foreignKey: 'profileUserId',
})
public user: BelongsTo<typeof User>
```

### Custom local key
`localKey` luôn là khóa chính của **related model**, nhưng có thể được định nghĩa rõ ràng.

```ts
@belongsTo(() => User, {
  localKey: 'uuid',
  foreignKey: 'profileUserId',
})
public user: BelongsTo<typeof User>
```

### Preloading relationship
API tải trước cho mối quan hệ thuộc về đã được đề cập [ở trên](#tai-truoc-moi-quan-he).

### Persisting relationship

Khi làm việc với belongsTo relationship, bạn luôn liên kết hoặc phân tách các mô hình với nhau.
Ví dụ: Bạn không bao giờ nói, hãy tạo người dùng cho hồ sơ này.
Thay vào đó, bạn nói, hãy liên kết hồ sơ với người dùng này .

Theo đúng tinh thần dễ đọc, một `belongsTo` relationship không có `create`
hoặc không có hàm `save`. Nó có hàm `associate` và `dissociate`.

#### associate

```ts
const user = await User.find(1)
const profile = new Profile()

profile.avatarUrl = 'foo.jpg'
profile.isActive = true

// Save profile with the user id of the user
await profile.related('user').associate(user)
```

#### dissociate

```ts
const profile = await Profile.find(1)
await profile.related('user').dissociate()
```

## Has Many

`HasMany` relationship tạo ra mối quan hệ **một nhiều** giữa hai model.
vd: Một người dùng có nhiều bài đăng.

```ts
export default class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}
```

`Post` Model phải có một cột khóa ngoại `userId` được xác định trên đó.

```ts
export default class Post extends BaseModel {
  @column()
  public userId: number
}
```

### Khóa ngoại tùy chỉnh

Theo mặc định, đó `foreignKey` là biểu diễn `camelCase` của **parent model name** và khóa chính của nó.

| Parent Model Name	| Primary Key	| Foreign Key
|-------|------------|------------|
| User | id | `userId`

Tuy nhiên, bạn cũng có thể xác định `foreignKey` tùy chỉnh.

```ts
@hasMany(() => Post, {
  foreignKey: 'authorId',
})
public posts: HasMany<typeof Post>
```

### Khóa cục bộ tùy chỉnh

`localKey` luôn là khóa chính **parent model**, nhưng có thể được định nghĩa rõ ràng.

```ts
@hasMany(() => Post, {
  localKey: 'uuid',
  foreignKey: 'authorId',
})
public posts: HasMany<typeof Post>
```

### Mối quan hệ bền vững