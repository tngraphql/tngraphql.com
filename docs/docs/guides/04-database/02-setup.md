---
permalink: guides/database/setup
category: Database
---

# Setup
Hiện tại, TNGraphQL hỗ trợ những loại cơ sở dữ liệu sau:

- MYSQL
- SQLite
- MSSQL
- PostgreSQL (cùng với Amazon Redshift)
- MariaDB

- và OracleDB

## Cấu hình

Cấu hình cho database nằm trong file `config/database.ts`.
Trong file này, bạn có thể khai báo tất cả các database connections, cũng như chỉ định connection nào là mặc định.

## Cấu hình SQlite
SQLite là một máy chủ database dựa trên file có trọng lượng nhẹ.
Bạn có thể nhanh chóng thiết lập và chạy SQLite bằng cách cài đặt từ npm.

```sh
npm i -D sqlite3
```

Tiếp theo, mở file `config/database.ts` để xem lại các tùy chọn cấu hình.

```ts{}{config/database.ts}
{
  // highlight-start
  connection: Env.get('DB_CONNECTION', 'sqlite'),
  // highlight-end

  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        // highlight-start
        filename: path.join(process.cwd(), 'tmp/db.sqlite'),
        // highlight-end
      },
      useNullAsDefault: true,
      healthCheck: false,
    },
  }
}
```
- Lucid dựa vào biến môi trường `DB_CONNECTION` để quyết định kết nối cơ sở dữ liệu mặc định sẽ sử dụng.
Vì vậy, hãy đảm bảo cập nhật `sqlite` vào bên trong file `.env`.
  ```sh
  DB_CONNECTION=sqlite
  ```
  
- Tệp cơ sở dữ liệu nằm bên trong thư mục `tmp`. Vì vậy, hãy đảm bảo tạo thư mục `tmp` trên mục gốc của dự án.
  ```sh
  mkdir tmp
  ```

## Cấu hình MySQL

Bước đầu tiên là có máy chủ MySQL chạy trên máy tính của bạn.
Bạn có thể [cài đặt MySQL](https://dev.mysql.com/downloads/installer/)
cho hệ điều hành của mình bằng cách làm theo các tài liệu chính thức.

Khi máy chủ đang chạy, hãy cài đặt trình điều khiển MySQL cho Node.js từ npm.

[note]
Bạn cũng có thể kết nối với MariaDb database bằng `mysql` driver.
[/note]

```sh
npm i mysql
```

Tiếp theo, mở tệp database config để xem lại các tùy chọn cấu hình.

```ts{}{config/database.ts}
{
  // highlight-start
  connection: Env.get('DB_CONNECTION', 'sqlite'),
  // highlight-end

  connections: {
    mysql: {
      client: 'mysql',
      connection: {
        // highlight-start
        host: Env.get('DB_HOST', '127.0.0.1'),
        port: Number(Env.get('DB_PORT', 3306)),
        user: Env.get('DB_USER', 'lucid'),
        password: Env.get('DB_PASSWORD', 'lucid'),
        database: Env.get('DB_NAME', 'lucid'),
        // highlight-end
      },
      healthCheck: false,
    },
  }
}
```

- Lucid dựa vào biến môi trường `DB_CONNECTION` để quyết định kết nối cơ sở dữ liệu mặc định sẽ sử dụng.
Vì vậy, hãy đảm bảo cập nhật `mysql` vào bên trong file `.env`.

- Ngoài ra, các giá trị database connection được đọc từ file `.env`. Vì vậy, hãy đảm bảo cập nhật chúng.
  ```sh
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_USER=root
  DB_PASSWORD=password
  DB_NAME=lucid
  ```

Với MySQL, bạn cũng có thể kết nối bằng cách sử dụng unix domain socket. Đặt `socketPath` sẽ bỏ qua máy chủ và cổng.

```ts
connections: {
  mysql: {
    client: 'mysql',
    connection: {
      // highlight-start
      socketPath: '/path/to/socket.sock',
      // highlight-end
      user: Env.get('DB_USER', 'lucid'),
      password: Env.get('DB_PASSWORD', 'lucid'),
      database: Env.get('DB_NAME', 'lucid'),
    },
    healthCheck: false,
  },
}
```

## Cấu hình PostgreSQL
Cũng giống như MySQL, bước đầu tiên với PostgreSQL cũng là cài đặt máy chủ cơ sở dữ liệu.
Đảm bảo làm theo [hướng dẫn chính thức](https://www.postgresql.org/download/) về cài đặt.

Khi máy chủ cơ sở dữ liệu đang chạy, hãy cài đặt trình điều khiển PostgreSQL cho Node.js từ npm.

```sh
npm i pg
```

Tiếp theo, mở tệp database config để xem lại các tùy chọn cấu hình.

```ts
{
  // highlight-start
  connection: Env.get('DB_CONNECTION', 'sqlite'),
  // highlight-end

  connections: {
    pg: {
      client: 'pg',
      connection: {
        // highlight-start
        host: Env.get('DB_HOST', '127.0.0.1'),
        port: Number(Env.get('DB_PORT', 5432)),
        user: Env.get('DB_USER', 'lucid'),
        password: Env.get('DB_PASSWORD', 'lucid'),
        database: Env.get('DB_NAME', 'lucid'),
        // highlight-end
      },
      healthCheck: false,
    },
  }
}
```

Một lần nữa, hãy đảm bảo cập nhật tệp `.env` với `DB_CONNECTION` và các giá trị cấu hình chính xác và khác.

```sh
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_USER=user
DB_PASSWORD=password
DB_NAME=lucid
```

Với PostgreSQL, bạn cũng có thể chuyển chuỗi kết nối thay vì xác định từng thuộc tính kết nối riêng biệt.

```ts
{
  connections: {
    pg: {
      client: 'pg',
      connection: 'postgres://someuser:somepassword@somehost:5432/somedatabase',
      healthCheck: false,
    },    
  }
}
```

## Các Database khác

Chúng tôi chưa đề cập đến việc thiết lập cho tất cả các cơ sở dữ liệu có thể có.
Tuy nhiên, quá trình này vẫn giống nhau đối với mọi máy chủ cơ sở dữ liệu khác.

- Khởi động và chạy máy chủ cơ sở dữ liệu.

- Cài đặt trình điều khiển từ npm. Sau đây là danh sách các trình điều khiển.

```sh
npm install pg
npm install sqlite3
npm install mysql
npm install mysql2
npm install oracledb
npm install mssql
```

- Cuối cùng, xác định một kết nối mới bên trong tệp `config/database.ts`.