---
permalink: guides/unions
category: Advanced guides
---

# Unions

Đôi khi API của chúng tôi phải linh hoạt và trả về một type không cụ thể 
nhưng một type từ một loạt các types. 
Một ví dụ có thể là chức năng tìm kiếm của trang phim: sử dụng cụm từ được cung cấp, 
chúng tôi tìm kiếm cơ sở dữ liệu cho tên phim và cả diễn viên.
Vì vậy, truy vấn phải trả về một danh sách  `Movie` hoặc `Actor` types.

Đọc thêm về Loại union GraphQL trong các [tài liệu chính thức của GraphQL](https://graphql.org/learn/schema/#union-types).

## Sử dụng

Hãy bắt đầu bằng cách tạo các loại đối tượng từ ví dụ trên:


[codegroup]

```ts{}{Movie}
@ObjectType()
class Movie {
  @Field()
  name: string;

  @Field()
  rating: number;
}
```

```ts{}{Actor}
@ObjectType()
class Actor {
  @Field()
  name: string;

  @Field(type => Int)
  age: number;
}
```

[/codegroup]

Bây giờ hãy tạo một loại `union` từ các loại `ObjectType` ở trên:

```ts
import { createUnionType } from '@tngraphql/graphql';

const SearchResultUnion = createUnionType({
  name: "SearchResult", // the name of the GraphQL union
  types: () => [Movie, Actor], // function that returns array of object types classes
});
```

Bây giờ chúng ta có thể sử dụng `union` trong `query`. 
```ts
@Resolver()
class SearchResolver {
  @Query(returns => [SearchResultUnion])
  async search(@Arg("phrase") phrase: string): Promise<Array<typeof SearchResultUnion>> {
    const movies = await Movies.findAll(phrase);
    const actors = await Actors.findAll(phrase);

    return [...movies, ...actors];
  }
}
```
[note]
Lưu ý rằng do giới hạn phản xạ của `TypeScript`, 
chúng tôi phải sử dụng rõ ràng giá trị `SearchResultUnion` trong trang trí `@Query`. 
Để đảm bảo an toàn cho kiểu biên dịch `TypeScript`,
chúng ta cũng có thể sử dụng typeof `SearchResultUnion` tương đương với kiểu `Movie | Actor`.
[/note]

## Loại giải quyết

Xin lưu ý rằng khi query/mutation trả về type (ObjectType class) là hợp nhất, 
chúng ta phải trả về một thể hiện cụ thể của `ObjectType`. graphql-js
Mặt khác, sẽ không thể phát hiện chính xác loại `GraphQL` bên dưới khi chúng ta 
sử dụng các đối tượng JS đơn giản.

Tuy nhiên, chúng tôi cũng có thể cung cấp `resolveType` thực hiện chức năng của riêng mình 
cho các `createUnionType` tùy chọn. 
Bằng cách này, chúng ta có thể trả về các đối tượng đơn giản trong các bộ phân giải 
và sau đó xác định loại đối tượng được trả về bằng cách kiểm tra loại đối tượng dữ liệu, ví dụ:

```ts
const SearchResultUnion = createUnionType({
  name: "SearchResult",
  types: () => [Movie, Actor],
  // our implementation of detecting returned object type
  resolveType: value => {
    if ("rating" in value) {
      return Movie; // we can return object type class (the one with `@ObjectType()`)
    }
    if ("age" in value) {
      return "Actor"; // or the schema name of the type as a string
    }
    return undefined;
  },
});
```

**Vvàà!** Bây giờ chúng ta có thể xây dựng lược đồ và thực hiện truy vấn mẫu

```graphql
query {
  search(phrase: "Holmes") {
    ... on Actor {
      # maybe Katie Holmes?
      name
      age
    }
    ... on Movie {
      # for sure Sherlock Holmes!
      name
      rating
    }
  }
}
```