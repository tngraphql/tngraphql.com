---
permalink: guides/database/migrations
category: Database
---

# Schema Migrations

Cho đến nay bạn đã biết về các cách tìm nạp hoặc duy trì dữ liệu bằng cách sử dụng trình tạo truy vấn cơ sở dữ liệu.
Trong hướng dẫn này, chúng tôi thực hiện một bước xa hơn và khám phá việc di chuyển lược đồ để tạo/thay đổi bảng cơ sở dữ liệu.

Đến cuối hướng dẫn này, bạn sẽ biết:

- Di chuyển giản đồ là gì và nó hoạt động như thế nào
- Sử dụng API Lucid Javascript để tạo, thay đổi hoặc xóa bảng.
- Các lệnh Ace để chạy hoặc khôi phục các di chuyển.

## Tổng quan Migrations

[Di chuyển lược đồ](https://en.wikipedia.org/wiki/Schema_migration)
cơ sở dữ liệu là một trong những chủ đề khó hiểu nhất trong lập trình phần mềm.
Nhiều khi các cá nhân thậm chí không hiểu sự cần thiết của việc sử dụng chuyển đổi so với việc tạo các bảng cơ sở dữ liệu theo cách thủ công.
Vì vậy, hãy lùi lại một bước và khám phá các tùy chọn có thể có để tạo/sửa đổi bảng bên trong cơ sở dữ liệu.

[note]
TnGraphQL sử dụng [Knex.js](https://knexjs.org/#Schema-Building) đằng sau hậu trường.
Đảm bảo kiểm tra tài liệu của họ để xem danh sách đầy đủ các loại cột và phương pháp bổ trợ.
[/note]

## Sử dụng ứng dụng GUI

Cách đơn giản nhất để tạo bảng cơ sở dữ liệu là sử dụng ứng dụng GUI như Sequel Pro,
Table plus, v.v. Những ứng dụng này rất tuyệt vời trong giai đoạn phát triển,
tuy nhiên, chúng có một số bước ngắn trong quá trình sản xuất.

- Bạn cần hiển thị máy chủ cơ sở dữ liệu của mình với Internet để ứng dụng GUI trên máy tính của bạn có thể kết nối với cơ sở dữ liệu sản xuất.
- Bạn không thể liên kết các thay đổi cơ sở dữ liệu với quy trình triển khai của mình. Mọi triển khai tác động đến cơ sở dữ liệu sẽ yêu cầu can thiệp thủ công.
- Họ không có lịch sử các bảng của bạn. Bạn không biết việc sửa đổi cơ sở dữ liệu được thực hiện khi nào và như thế nào.

## Tập lệnh SQL tùy chỉnh

Một tùy chọn khác là tạo các tập lệnh SQL và chạy chúng trong quá trình triển khai. Tuy nhiên, bạn sẽ phải xây dựng hệ thống theo dõi theo cách thủ công để đảm bảo rằng bạn không chạy các tập lệnh SQL đã chạy trước đó. Ví dụ:

- Bạn viết một tập lệnh SQL để tạo một usersbảng mới .
- Bạn chạy tập lệnh này như một phần của quy trình triển khai. Tuy nhiên, bạn phải đảm bảo rằng lần triển khai tiếp theo phải bỏ qua tập lệnh sql đã thực thi trước đó.

## Sử dụng Schema Migrations

Migrations giải quyết các vấn đề trên và cung cấp một API mạnh mẽ để phát triển và theo dõi các thay đổi cơ sở dữ liệu.
Có nhiều công cụ có sẵn để di chuyển lược đồ, từ các công cụ bất khả tri khung như flywaydb đến công cụ khung cụ thể được cung cấp bởi Rails, Laravel, v.v.

Tương tự, TnGraphQL cũng có hệ thống di chuyển riêng của mình. Bạn có thể tạo/sửa đổi cơ sở dữ liệu chỉ bằng cách viết Javascript.

## Tạo Migrations

Hãy bắt đầu bằng cách thực hiện lệnh ace sau đây để tạo một tệp migration mới.

```bash
ts-node ace make:migration users2412
```

Mở tệp mới tạo bên trong trình soạn thảo văn bản và thay thế nội dung của nó bằng đoạn mã sau.

```ts
import { Schema as BaseSchema } from '@tngraphql/lucid/build/src/Schema';

export default class Users extends BaseSchema {
    protected tableName = 'users'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.string('email', 191).unique().notNullable()
            table.string('password').notNullable()
            table.timestamps()
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
```

Cuối cùng, chạy lệnh `ace` sau để thực hiện hướng dẫn tạo bảng `users`.

```bash
ts-node ace migration:run

# Migrations source base dir: build
# Last compiled at: Mar 31, 2020, 4:11 PM

# completed database/migrations/1584350623957_users (batch: 1) 👈
```

Xin chúc mừng! Bạn vừa tạo và thực hiện lần di chuyển đầu tiên của mình.
Nếu bạn chạy lại cùng một lệnh, Lucid sẽ không thực thi tệp di chuyển, vì nó đã được thực thi.

```bash
node ace migration:run

# Already upto date 👈
```

#### Nó hoạt động như thế nào?

- Các lệnh `make:migration` tạo ra một tập tin migration mới bắt đầu bằng dấu thời gian.
Dấu thời gian rất quan trọng vì quá trình di chuyển được thực hiện theo thứ tự tăng dần theo tên.

- Các tệp migration không chỉ giới hạn trong việc tạo một bảng mới.
Bạn cũng có thể lập bảng `alter`, xác định trình kích hoạt cơ sở dữ liệu, v.v.

- Các lệnh `migration:run` thực thi tất cả migration chưa giải quyết.

- Tệp migration ở trạng thái ` pending` hoặc trạng thái `completed` không bao giờ được thực thi bằng lệnh migration:run.

- Khi một tệp migration đã được thực thi thành công,
nó sẽ được theo dõi bên trong bảng `tngraphql_schema` cơ sở dữ liệu để tránh chạy nó nhiều lần.

## Rollback migrations hiện tại

Đôi khi bạn sẽ mắc lỗi khi viết migration.
Nếu bạn đã chạy quá trình di chuyển bằng lệnh `migration:run`,
thì bạn không thể chỉ chỉnh sửa tệp và chạy lại nó,
vì tệp đã được theo dõi trong danh sách các lần migration đã hoàn thành.

Thay vào đó, bạn có thể khôi phục quá trình di chuyển bằng cách chạy lệnh `migration:rollback`.
Giả sử tệp migration được tạo trước đó đã tồn tại, việc chạy lệnh `rollback` sẽ làm rớt bảng `users`.

```bash
ts-node ace migration:rollback

# completed database/migrations/1584350623957_users (batch: 1)
```

#### Rollback hoạt động như thế nào?

- Mỗi lớp migration có hai phương thức, `up` và `down`. Các `down` được gọi trong quá trình `rollback`.

- Bạn (nhà phát triển) có trách nhiệm viết các hướng dẫn chính xác để hoàn tác các thay đổi được thực hiện theo phương thức `up` này.

Ví dụ: Nếu phương thức `up` tạo một bảng, thì phương thức `down` đó phải gỡ nó xuống.

- Sau khi khôi phục, Lucid coi tệp di chuyển đang chờ xử lý và đang chạy `migration:run` sẽ chạy lại tệp đó.
Vì vậy, bạn có thể sửa đổi tệp này và sau đó chạy lại nó.

## Tránh rollback

Thực hiện rollback trong quá trình phát triển là hoàn toàn tốt,
vì không sợ mất dữ liệu.
Tuy nhiên, thực hiện rollback trong sản xuất thực sự không phải là một lựa chọn trong đa số trường hợp.
Hãy xem xét ví dụ này:

- Bạn tạo và chạy migration để thiết lập bảng users.

- Hiện tại, bảng này đã nhận được dữ liệu vì ứng dụng đang chạy trong phiên bản sản xuất.

- Sản phẩm của bạn đã phát triển và bây giờ bạn muốn thêm một cột mới vào bảng users.

- Bạn không thể chỉ cần khôi phục, chỉnh sửa quá trình di chuyển hiện tại và sau đó chạy lại nó, bởi vì,
quá trình khôi phục sẽ làm mất bảng `users` => các dữ liệu users của bạn sẽ bay theo.

- Thay vào đó, bạn tạo một tệp migration mới để thay đổi bảng `users` hiện có bằng cách thêm cột bắt buộc.
Nói cách khác, migration phải luôn tiến về phía trước.

#### Ví dụ thay thế

Sau đây là một ví dụ về việc tạo một chuyển đổi mới để thay đổi bảng hiện có.

[codegroup]

```bash{}{Make migration}
ts-node ace make:migration add_last_login_column --table=users

# ✔  create    database/migrations/1584415438372_add_last_login_columns.ts
```
```ts{}{migration}
import { Schema as BaseSchema } from '@tngraphql/lucid/build/src/Schema';
export default class Users extends BaseSchema {
  protected $tableName = 'users'

  public async up () {
    this.schema.table(this.$tableName, (table) => {
      table.dateTime('last_login_at')
    })
  }

  public async down () {
    this.schema.table(this.$tableName, (table) => {
      table.dropColumn('last_login_at')
    })
  }
}
```

[/codegroup]