---
permalink: guides/database/seeds-and-factories
category: Database
---

# Seeds & Factories

Khi bạn đã chuẩn bị lược đồ cơ sở dữ liệu của mình với việc [migrations](migrations),
bước tiếp theo là thêm một số dữ liệu. Đây là nơi **Seeds** & **Factories** xuất hiện trong bức tranh.

## Seeds

Tạo `seeder` là một cách để thiết
lập ứng dụng của bạn với một số dữ liệu ban đầu được yêu cầu để chạy và sử dụng ứng dụng. Ví dụ:

- Tạo `seeder` để chèn các quốc gia, tiểu bang và thành phố trước khi triển khai và chạy ứng dụng của bạn.

- Hoặc một `seeder` để chèn người dùng vào bên trong cơ sở dữ liệu để phát triển cục bộ.

Trong TNGraphQL, các seeder được lưu trữ bên trong thư mục `database/seeders`.
Bạn có thể tạo seeder theo cách thủ công hoặc chạy lệnh ace sau đây để tạo cho bạn.

```bash
ts-node ace make:seeder UserSeeder
```

Tệp seeder là một lớp Javascript chuẩn như trong ví dụ sau:

```ts{}{database/seeders/UserSeeder.ts}
export class UserSeeder {
    public async run() {
        await User.createMany([
            {
                email: 'nguyenpl117@gmail.com',
                password: 'secret',
            },
            {
                email: 'random@gmail.com',
                password: 'supersecret'
            }
        ])
    }
}
```

- Như bạn có thể thấy, đây `UserSeeder` là một lớp Javascript tiêu chuẩn.

- Trong `run` phương thức, bạn có thể thực thi các hoạt động cơ sở dữ liệu.

### Chạy seeders

Bạn có thể thực thi tất cả hoặc các seeder đã chọn như hình dưới đây:

```bash
ts-node ace seed
```

### Hoạt động lý tưởng

Không giống như migrations, không có hệ thống theo dõi dành cho người tạo cơ sở dữ liệu.
Nói cách khác, việc thực thi một trình seeder nhiều lần cũng sẽ thực hiện việc chèn nhiều lần.

Dựa trên bản chất của một seeder, bạn có thể muốn hoặc không muốn hành vi này. Ví dụ:

- Bạn có thể chạy một `PostSeeder` nhiều lần và tăng số lượng bài viết bạn có trong cơ sở dữ liệu.

- Mặt khác, bạn muốn `CountrySeeder` chỉ thực hiện chèn một lần. Những loại seeder này có bản chất không tốt.

Đừng lo, các mô hình Lucid đã hỗ trợ sẵn cho các hoạt động Idempotent bằng cách sử dụng các phương thức như `updateOrCreate` hoặc `fetchOrCreateMany`.
Tiếp tục với `CountrySeeder`, sau đây là một ví dụ về việc tạo quốc gia chỉ một lần.

```ts
export default class CountrySeeder {

  public async run () {
    const uniqueKey = 'isoCode'

    await Country.updateOrCreateMany(uniqueKey, [
      {
        isoCode: 'IN',
        name: 'India',
      },
      {
        isoCode: 'FR',
        name: 'France',
      },
      {
        isoCode: 'TH',
        name: ' Thailand',
      },
    ])
  }

}
```

Trong ví dụ trên, Phương thức `updateOrCreateMany` này sẽ tìm kiếm các hàng hiện có bên trong cơ sở dữ liệu bằng cách sử dụng mã `isoCode` và chỉ chèn những hàng bị thiếu và do đó chạy `CountrySeeder` nhiều lần sẽ không chèn các hàng trùng lặp.

[note]
Tìm hiểu thêm về các phương pháp Idempotent khác [tại đây](../orm/crud-operations#find-or-create).
[/note]

## Factories

Các nhà máy xác định cấu trúc dữ liệu (bản thiết kế) được sử dụng để tạo dữ liệu giả.

Bản thiết kế của nhà máy được đặt bên trong database/factory.jstệp: