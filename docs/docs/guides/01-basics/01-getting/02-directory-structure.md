---
permalink: guides/directory-structure
---

# Cấu trúc thư mục
Cấu trúc dự án mặc định của TN-GraphQL đóng vai trò là điểm khởi đầu tuyệt vời để phát triển
các ứng dụng mới.
TN-GraphQL cung cấp một bộ tệp và thư mục thông thường để tăng tốc quá trình phát triển và
loại bỏ nhu cầu nối dây ứng dụng bằng tay.

Đến cuối hướng dẫn này, bạn sẽ hiểu khá rõ về cấu trúc dự án và mục đích của các tệp khác nhau.

## Structure Preview

```sh
.
├── src
    ├── app
        ├── Console
        ├── Exceptions
        ├── GraphQL
        ├── Providers
    ├── config
    ├── database
    ├── start
        ├── route.ts
    ├── index.ts
├── tests
├── .editorconfig
├── .env
├── .env.example
├── .gitignore
├── ace.ts
├── package.json
├── tsconfig.json
├── tslint.json
```

## The Project Root
Thư mục gốc của dự án có tất cả các tệp cấu hình / meta cần thiết để thiết
lập không gian làm việc phát triển.
Hãy lướt qua danh sách các tập tin và mục đích của chúng.

#### tsconfig.json
Việc `tsconfig.json` chứa cấu hình cho [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
Tệp này phải tồn tại để TN-GraphQL biên dịch mã của bạn thành JavaScript.
Ngoài ra, trình soạn thảo văn bản của bạn có thể sử dụng cùng một tệp này
cho các tính năng như intellisense, tự động nhập và phát hiện lỗi.

#### .tslint.json
Các tệp này được tạo để lint mã TypeScript của bạn bằng cách sử dụng [tslint](https://palantir.github.io/tslint/) .

#### .env

TN-GraphQL dựa vào các [environment variables](environment-variables) để giữ cấu hình cụ thể của môi trường.

Ví dụ: Thông tin cơ sở dữ liệu trên máy cục bộ của bạn sẽ luôn khác với thông tin trong sản xuất và do đó bạn phải sử dụng các biến môi trường để định cấu hình chúng.

Trong quá trình phát triển, bạn có thể định nghĩa các biến này bên trong file `.env` dưới dạng **key-value pairs**.

```bash
NODE_ENV=development
MYSQL_USERNAME=graphql
```

Vì bạn khônng bao giờ commit `.env` file lên hệ thống quản lý phiên bản như GIT. 
Chúng tôi tạo 1 file `.env.example` để lưu trữ các mẫu biến environment của bạn chỉ với các khóa và không lưu giá trị.
Sử dụng file `.env.example`, các thành viên trong nhóm của bạn có thể tạo file `.env` của riêng họ.

```bash
NODE_ENV=
MYSQL_USERNAME=
```

#### .gitignore

TN-GraphQL tạo file `.gitignore` theo mặc định với giả định rằng bạn có thể sử dụng Git để kiểm soát phiên bản. Hãy xóa tệp này nếu bạn không sử dụng Git.

## Thư mục `app`
Thư mục `app` chứa các tệp nguồn cho ứng dụng của bạn.
**GraphQL**, **Models**, **Services**, tất cả được lưu trữ trong thư mục này.

## Thư mục `config`
Tất cả các cấu hình thời gian chạy ứng dụng được lưu trữ trong `config` thư mục.
TN-GraphQL xuất xưởng với một loạt các tệp cấu hình được ghi chép tốt được sử dụng bởi lõi của framework.

Khi ứng dụng của bạn sẽ phát triển, bạn cũng có thể sử dụng thư mục này để lưu trữ các tệp cấu hình bổ sung.

## Thư mục `start`
Thư mục `start` chứa các tệp chỉ được tải một lần trong quá trình khởi động ban đầu.

Mặc dù khung không tự động tải các tệp này, việc giữ chúng trong một thư mục riêng cho thấy mục đích rõ ràng.

## Thư mục `database`
Thư mục `database` chứa các cơ sở dữ liệu `database migrations and seed files`.
Giống như thư mục `start`, thư mục`database` được tạo để chỉ ra mục đích rõ ràng cho các tệp đã cho.

## Thư mục `providers`
Thư mục `providers` chứa tất cả `Service providers` ứng dụng của bạn.
Service providers khởi động ứng dụng của bạn bằng các services trong service container,
đăng ký events, hoặc thực hiện bất kỳ một công việc khác để chuẩn bị cho request đến ứng dụng của bạn.

Khi bạn mới cài xong project, thư mục đã chứa một số providers.
Bạn có thể thoải mái thêm providers của bạn vào nếu cần.
```sh
ts-node ace make:provider MySampleProvider
```

## Thư mục `GraphQL`
Thư mục `GraphQL` có chưa các `resolve`, `type` và `middleware`
Tất cả các logic xử lý requests vào ứng dụng của bạn sẽ nằm ở trong thư mục này.
```sh
ts-node ace make:resolve UserResolve
ts-node ace make:type UserType
ts-node ace make:middleware AclMiddleware
```
## Tập tin `ace` và thư mục `Console`
TN-GraphQL là một Node.js framework, được cung cấp command like `ace`.
Tập tin `ace.ts` trong thư mục gốc của dự án là điểm bắt đầu cho thực hiện lệnh CLI.

Thư mục `Console` chứa tất cả các lệnh `ace` tùy chỉnh cho ứng dụng của bạn.
Các lệnh này có thể được tạo bằng lệnh. Thư mục này cũng chưa kernel console của bạn,
đây là nơi các lệnh `ace` tùy chỉnh của bạn được đăng ký.
```sh
ts-node ace make:command Greet
```

## Tập tin `src/index.ts`
Tập tin `src/index.ts` là điểm vào để khởi động ứng dụng và khởi động máy chủ HTTP.
Nếu được yêu cầu, bạn cũng có thể khởi động máy chủ HTTP bằng cách chạy tệp này trực tiếp.
Ví dụ:
```sh
ts-node-dev src/index.ts # Starts the server
```