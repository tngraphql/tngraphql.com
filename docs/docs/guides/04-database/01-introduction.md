---
permalink: guides/database/introduction
category: Database
under_progress: true
last_updated_on: 1st March, 2020
---

# Giới thiệu

TNGraphQL cho phép bạn xây dựng ứng dụng theo hướng dữ liệu một cách nhanh chóng và dễ dàng.

Trong hướng dẫn này, chúng tôi sẽ nói ngắn gọn về các chủ đề sau. Khi bạn đã có hiểu biết cơ bản, bạn có thể tìm hiểu các hướng dẫn chuyên sâu về các chủ đề riêng lẻ.

- Database query builder

- Data Models

- Schema migrations

- Seeds & Factories

## Database query builder
Trình tạo truy vấn cơ sở dữ liệu cung cấp một API phong phú để tạo các truy vấn SQL, từ đơn giản **select all** đến **complex joins**.

Không cần phải viết SQL bằng tay.
Chỉ cần sử dụng API Javascript của chúng tôi và chúng tôi sẽ tạo truy vấn SQL chính xác cho công cụ cơ sở dữ liệu đang sử dụng. Ví dụ:

```ts
import { Database } from "@tngraphql/illuminate/dist/Support/Facades";

const users = await Database.from('users').select('*')
// SQL:  SELECT * FROM "users";
```

Tương tự, bạn có thể xây dựng các truy vấn phức tạp với mệnh đề where và các phép nối.

```ts
import { Database } from "@tngraphql/illuminate/dist/Support/Facades";

const users = await Database
    .from('users')
    .select('*')
    .where('username', 'virk')
    .innerJoin('profiles', 'users.id', 'profiles.user_id')
    .first()
// SQL: SELECT * FROM `users` inner join `profiles` on `users`.`id` = `profiles`.`user_id` where `username` = ? limit ?
```

Mục tiêu của `query builder` là cung cấp cho bạn một API khai báo để tạo các truy vấn SQL mà không ngăn bạn sử dụng sức mạnh của SQL.
Mọi thứ bạn có thể viết bằng SQL thô cũng được hỗ trợ bởi [query builder](query-builder) hoặc [raw query builder](query-builder#executing-raw-queries)

## Data Models

Query builder thực hiện một công việc tuyệt vời bằng cách cho phép bạn viết các truy vấn SQL bằng JavaScript API.
Tuy nhiên, kết quả của mọi truy vấn là một mảng các đối tượng JavaScript thuần túy.

Hãy tưởng tượng, bạn tìm nạp một mảng người dùng và mỗi đối tượng người dùng có một thuộc tính `date_of_birth`.
Trước khi trả lại dữ liệu cho máy khách, bạn muốn tính toán `age` của người dùng. Bạn sẽ làm điều này như thế nào?

- Vâng, bạn sẽ phải lặp lại mảng.

- Tính toán `age` của người dùng.

- Đính kèm một thuộc tính mới vào đối tượng hiện có.

- Xóa thuộc `date_of_birth` tính.

- Gửi phản hồi.

```ts
import { DateTime } from 'luxon'

const users = await Database.from('users').select('*')

return users.map((user) => {
  const dob = DateTime.fromJSDate(user.date_of_birth)
  user.age = DateTime.local().diff(dob, 'years').years

  delete user.date_of_birth
  return user
})
```

Ví dụ mã trên không có gì là xấu.
Nhưng hãy tưởng tượng việc viết những biến đổi này ở khắp mọi nơi bên trong code của bạn.
Chúng ta có thể làm tốt hơn điều này bằng cách sử dụng `data model`.

### Nói xin chào với data model

Data model được định nghĩa là các lớp JavaScript và mỗi lớp có nghĩa là để truy vấn một bảng cơ sở dữ liệu duy nhất.
Thay vì sử dụng `Database` đối tượng để thực thi các truy vấn, bạn sẽ sử dụng `model` để tạo và chạy các truy vấn SQL. Ví dụ:

[codegroup]

```ts{}{Defining model}
import { DateTime } from 'luxon'
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { column } from '@tngraphql/lucid/build/src/Orm/Decorators';

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public email: string

    @column.date()
    public dateOfBirth: DateTime
}
```
```ts{}{using model}
import User from 'App/Models/User'

// select all
const users = await User.all()

// using query builder
const user = await User.query().where('username', 'virk').first()
```

[/codegroup]

Một trong những khác biệt chính giữa **Database query builder** và **Model** là các models
trả về một mảng **class trên các đối tượng thuần túy**.
Sự khác biệt đơn giản này làm cho các mô hình trở nên mạnh mẽ hơn so với query builder.

Trở lại với ví dụ trước đó về người dùng máy tính `age` từ `date_of_birth`.
Sau đây là một ví dụ về việc đạt được cùng một kết quả mà không cần thực hiện các phép biến đổi nội tuyến bên trong một vòng lặp.

```ts
import { DateTime } from 'luxon'
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';
import { column, computed } from '@tngraphql/lucid/build/src/Orm/Decorators';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column.date({ serializeAs: null })
  public dateOfBirth: DateTime

  @computed()
  public get age () {
    return DateTime.local().diff(this.dateOfBirth, 'years').years
  }
}
```

```ts
import User from 'App/Models/User'
const users = await User.all()

/**
 * The computed property "age" will be added to the
 * user object during `user.toJSON` call.
 */
return users.map((user) => user.toJSON())
```

Như bạn thấy, models giúp bạn có thể gắn hành vi vào các hàng được tìm nạp từ cơ sở dữ liệu
và chỉ điều này sẽ giúp bạn dọn dẹp rất nhiều phép biến đổi dữ liệu nội tuyến.

Còn rất nhiều điều cần khám phá với Data models.
Chúng tôi khuyên bạn nên đọc [hướng dẫn chuyên dụng](../orm/introduction) để hiểu sâu hơn.

## Schema migrations

migrations cho phép bạn **tạo/thay đổi các bảng cơ sở dữ liệu**.
Lúc đầu, việc di chuyển migrations thấy nhỏ,
vì người ta có thể đăng nhập vào một ứng dụng GUI và có thể tạo bảng theo cách thủ công.

Tuy nhiên, quá trình thủ công có một loạt các thiếu sót như.

- Database phải public để ứng dụng GUI kết nối.
- Các thay đổi không gắn liền với quy trình công việc và luôn phải can thiệp thủ công.
- Không có lịch sử xung quanh sự phát triển của cơ sở dữ liệu.

Việc `Schema migrations` giải quyết tất cả các vấn đề trên bằng cách cung cấp một lớp mạnh mẽ để quản lý các thay đổi cơ sở dữ liệu dưới dạng code.
Hãy nhớ đọc hướng dẫn [Schema migrations](migrations) để hiểu rõ hơn.


## Seeds & Factories

Mọi ứng dụng đang được phát triển đều cần dữ liệu giả ở một số giai đoạn.
Nó có thể là trong khi `test` hoặc khi chia sẻ code của bạn với đồng nghiệp.

Một tùy chọn là chèn dữ liệu theo cách thủ công bằng ứng dụng GUI,
nhưng cách tiếp cận tốt hơn là tự động hóa quy trình này và đây là lúc `Seeds & Factories` xuất hiện.

- Seeders cho phép bạn chèn dữ liệu vào cơ sở dữ liệu của mình bằng cách chạy một lệnh `db:seed` duy nhất.

- Dựa trên lượng dữ liệu bạn muốn đưa vào, việc nhập các giá trị cho mỗi hàng theo cách thủ công có thể rất tẻ nhạt.
`Factories` giúp bạn tạo dữ liệu giả một cách nhanh chóng.

- Kết hợp `Seeds & Factories` với nhau, bạn sẽ có một `seeding database` rất mạnh mẽ mà không cần can thiệp thủ công.


Chúng tôi khuyên bạn nên đọc hướng dẫn chuyên dụng về [Seeds & Factories](seeds) để hiểu sâu hơn.