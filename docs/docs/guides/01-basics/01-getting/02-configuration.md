---
permalink: guides/configuration
category: Getting Started
---

# Cấu hình

## Introduction
Tất cả các files cấu hình của TN-GraphQL framework nó sẽ được đặt trong thư mục `config`.
Với mỗi file trong thư mục đó,
bạn có thể chỉnh sửa cấu hình theo ý bạn muốn.

## Config Provider

Bước đầu tiên để có một cơ sở mã duy trì là tìm một vị trí chuyên dụng để lưu trữ
 cấu hình ứng dụng.

TN-GraphQL sử dụng config thư mục, nơi tất cả các tệp được tải khi khởi động

Bạn có thể truy cập các giá trị cấu hình thông qua Config Provider:
```ts
import { Config } from 'tn-illuminate/dist/Support/Facades';

const appSecret = Config.get('app.appSecret');
```
Các giá trị cấu hình được tìm nạp bằng cách `Config.get `
chấp nhận đối số chuỗi tham chiếu khóa bạn muốn trong biểu mẫu `fileName.key`.

Bạn có thể tìm nạp các giá trị cấu hình lồng nhau bằng cách sử dụng ký hiệu chấm:
```ts
// Example of a configuration file e.g. database.js
{
  mysql: {
    host: '127.0.0.1',
  },
}

// You can retrieve it like so...
Config.get('database.mysql.host')
```

Nếu bạn không chắc chắn rằng khóa được xác định trong cấu hình của mình,
bạn có thể cung cấp đối số thứ hai sẽ được trả về làm giá trị mặc định:
```ts
Config.get('database.mysql.host', '127.0.0.1')
```
Nếu bạn muốn thay đổi các giá trị cấu hình trong bộ nhớ, hãy sử dụng
`Congif.set`
```ts
Config.set('database.mysql.host', 'db.example.com')
```

[note]
`Config.set` sẽ chỉ thay đổi giá trị trong bộ nhớ .
 Nó sẽ không ghi giá trị mới vào tập tin cấu hình của bạn.
[/note]
## Environment Configuration
Thông thường, nó khá là hữu ích khi ứng dụng của bạn có giá trị cấu hình khác nhau trên
các môi trường khác nhau. Giả sử, bạn cấu hình giá trị cache trên local của bạn và trên 
production của bạn khác nhau.

Để làm việc đó, TN_GraphQL tận dụng thư viện [dotenv](https://github.com/motdotla/dotenv).
Khi một ứng dụng mới được cài đặt, tại thư mục gốc sẽ có file `.env.example` file.
Nếu bạn cài bằng TN-GraphQL CLI, file đấy sẽ tự động đổi tên thành ```.env```.
Nếu không thì bạn cần đổi tên file.

File `.env` không nên đẩy lên trình quản lý code (như git, snv, ...) vì với mỗi một developer /
server sẻ dụng ứng dụng sẽ cần yêu cầu những cấu hình khác nhau.
Vì thế, đây là một cách để kẻ xấu có thể xâm nhập vào kho quản lý code
của bạn vì những thông tin nhạy cảm sẽ bị lộ.

Các tập tin `.env` có một cú pháp đơn giản `key=value`:
```ts
APP_SECRET=F7op5n9vx1nAkno0DsNgZm5vjNXpOLIq
DB_HOST=127.0.0.1
DB_USER=root
```
Bạn có thể truy cập tập tin bằng cách sử dụng Provider Env
```ts
import { Env } from 'tn-illuminate/dist/Support/Facades';
const appSecret = Env.get('APP_SECRET')
```
Giống như Provider Config, bạn có thể cung cấp một giá trị mặc định làm đối số thứ hai:
```ts
Env.get('DB_USER', 'root')
```

`Env.get` luôn luôn trả lại a `string`.
Nếu bạn muốn một `Env` giá trị hoạt động như `boolean`,
bạn sẽ cần kiểm tra nó thông qua một câu lệnh đẳng thức có điều kiện, như vậy:
```ts
const myBoolean = Env.get('MY_BOOLEAN') === 'true'
```
### Trả về lỗi nếu không tồn tại biến môi trường được yêu cầu.
Khi bạn có một biến môi trường được yêu cầu để chạy ứng dụng của mình,
bạn có thể sử dụng `Env.getOrFail()` để đưa ra lỗi nếu biến yêu cầu không được đặt.
```ts
const Env = use('Env')
// Throw "Make sure to define APP_SECRET inside .env file."
Env.getOrFail('APP_SECRET')
```

## Testing Environment

Nếu bạn đang bắt đầu ứng dụng của mình `NODE_ENV` được đặt thành `testing`,
TN-GraphQL sẽ tải. `env.testing` tệp của bạn và hợp nhất các giá trị của nó trên `.env`
tệp của bạn .

Điều này rất hữu ích để đặt các thông tin khác nhau khi kiểm tra cơ sở mã của bạn.