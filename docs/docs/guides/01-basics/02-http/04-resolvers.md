---
permalink: guides/http/resolvers
category: The Basics
---

# Resolvers

## Queries and Mutations

### Resolver classes

Đầu tiên chúng ta tạo lớp trình phân giải và chú thích nó với trình `@Resolver()` trang trí.
Lớp này sẽ hoạt động giống như một bộ điều khiển từ các khung REST cổ điển:

```ts
@Resolver()
class RecipeResolver {}
```

Chúng ta có thể sử dụng khung DI (như được mô tả trong [tài liệu tiêm phụ thuộc](di) )
để tiêm phụ thuộc lớp (như dịch vụ hoặc kho lưu trữ)
hoặc để lưu trữ dữ liệu bên trong lớp trình phân giải - 
nó được đảm bảo là một phiên bản duy nhất cho mỗi ứng dụng.

```ts
@Resolver()
class RecipeResolver {
  private recipesCollection: Recipe[] = [];
}
```

Sau đó, chúng ta có thể tạo các method class sẽ xử lý các query và mutation.
Ví dụ: hãy thêm `recipes` truy vấn để trả về một bộ sưu tập tất cả recipes:

```ts
@Resolver()
class RecipeResolver {
  private recipesCollection: Recipe[] = [];

  async recipes() {
    // fake async in this example
    return await this.recipesCollection;
  }
}
```

Chúng ta cũng cần làm hai việc.
Đầu tiên là thêm trình trang trí `@Query`, 
đánh dấu phương thức lớp là GraphQL query. Thứ hai là cung cấp loại trả lại. 
Vì phương thức này không đồng bộ, nên hệ thống siêu dữ liệu phản chiếu hiển thị kiểu trả 
về là a `Promise`, vì vậy chúng ta phải thêm tham số của trình trang trí 
`returns => [Recipe]` để khai báo nó phân giải thành một mảng các `Recipe` loại đối tượng.

```ts
@Resolver()
class RecipeResolver {
  private recipesCollection: Recipe[] = [];

  @Query(returns => [Recipe])
  async recipes() {
    return await this.recipesCollection;
  }
}
```

### Arguments

Thông thường, các query có một số đối số - đó có thể là id của tài nguyên, 
cụm từ tìm kiếm hoặc cài đặt phân trang. 
TNGraphQL cho phép bạn xác định các đối số theo hai cách.

Đầu tiên là phương pháp nội tuyến bằng cách sử dụng trang trí `@Arg()`. 
Hạn chế là cần lặp lại tên đối số (do giới hạn của hệ thống phản chiếu) 
trong tham số trang trí. Như chúng ta có thể thấy bên dưới, 
chúng ta cũng có thể vượt qua một `defaultValue` tùy chọn sẽ được phản ánh trong lược đồ GraphQL.

```ts
@Resolver()
class RecipeResolver {
  // ...
  @Query(returns => [Recipe])
  async recipes(
    @Arg("title", { nullable: true }) title?: string,
    @Arg("servings", { defaultValue: 2 }) servings: number,
  ): Promise<Recipe[]> {
    // ...
  }
}
```

Điều này hoạt động tốt khi có 2 - 3 args.
Nhưng khi bạn có nhiều hơn nữa, các định nghĩa phương thức của trình phân giải trở nên cồng kềnh. 
Trong trường hợp này, chúng ta có thể sử dụng một định nghĩa class để mô tả các đối số.
Nó trông giống như [object type class](object-type-class) nhưng nó có trang trí `@ArgsType()` trên đầu.
```ts
@ArgsType()
class GetRecipesArgs {
  @Field(type => Int, { nullable: true })
  skip?: number;

  @Field(type => Int, { nullable: true })
  take?: number;

  @Field({ nullable: true })
  title?: string;
}
```
Chúng ta có thể xác định các giá trị mặc định cho các trường `@Field()`
bằng tùy chọn `defaultValue` hoặc bằng cách sử dụng trình khởi tạo thuộc tính - 
trong cả hai trường hợp TNGraphQL sẽ phản ánh điều này trong lược đồ bằng
cách đặt giá trị mặc định và làm cho trường không thể bị `null`.

Ngoài ra, cách khai báo đối số này cho phép bạn thực hiện xác nhận. 
Bạn có thể tìm hiểu thêm chi tiết về tính năng này trong các [tài liệu validation](validation) . 
Bạn cũng có thể định nghĩa các trường và phương thức của trình trợ giúp cho các đối số 
hoặc lớp đầu vào của bạn.

```ts
import { Rules } from '@tngraphql/illuminate';

@ArgsType()
class GetRecipesArgs {
  @Field(type => Int, { defaultValue: 0 })
  @Rules('min:0')
  skip: number;

  @Field(type => Int)
  @Rules(['min:1', 'max:50'])
  take = 25;

  @Field({ nullable: true })
  title?: string;

  // helpers - index calculations
  startIndex = skip;
  endIndex = skip + take;
}
```

Sau đó, tất cả những gì còn lại phải làm là sử dụng class args làm kiểu của tham số phương thức.
Chúng ta có thể sử dụng cú pháp [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
để có quyền truy cập vào các đối số duy nhất dưới dạng các biến, 
thay vì tham chiếu đến toàn bộ đối tượng args.

```ts
@Resolver()
class RecipeResolver {
  // ...
  @Query(returns => [Recipe])
  async recipes(@Args() { title, startIndex, endIndex }: GetRecipesArgs) {
    // sample implementation
    let recipes = this.recipesCollection;
    if (title) {
      recipes = recipes.filter(recipe => recipe.title === title);
    }
    return recipes.slice(startIndex, endIndex);
  }
}
```

### Input types

GraphQL mutations cũng tương tự như tạo: Khai báo phương thức của lớp, sử dụng trang trí `@Mutation`,
tạo arguments cung cấp một return type (Nếu cần). Tuy nhiên trong mutations chúng ta thường hay
sử dụng `input` types, do đó TNGraphQL cho phép chúng ta tạo ra đầu vào 
trong cùng một cách như [Object Type]() nhưng bằng cách sử dụng trang trí `@InputType()`

```ts
@InputType()
class AddRecipeInput {}
```

Để đảm bảo chúng tôi không vô tình thay đổi loại thuộc tính,
chúng tôi tận dụng hệ thống kiểm tra loại `TypeScript` bằng cách triển khai loại `Partial`:

```ts
@InputType()
class AddRecipeInput implements Partial<Recipe> {}
```

Sau đó, chúng tôi khai báo bất kỳ input nào chúng tôi cần, 
sử dụng trình trang trí `@Field()`:

```ts
@InputType({ description: "New recipe data" })
class AddRecipeInput implements Partial<Recipe> {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;
}
```

Sau đó chúng ta có thể sử dụng `AddRecipeInput` loại trong đột biến của chúng tôi. 
Chúng ta có thể thực hiện nội tuyến này (sử dụng trình `@Arg()` trang trí) 
hoặc như một args class như trong ví dụ query ở trên.

Chúng tôi cũng có thể cần truy cập vào context. 
Để đạt được điều này, chúng tôi sử dụng trình trang trí `@Ctx()` với `Context` 
interface do người dùng xác định tùy chọn:
```ts
@Resolver()
class RecipeResolver {
  // ...
  @Mutation()
  addRecipe(@Arg("data") newRecipeData: AddRecipeInput, @Ctx() ctx: Context): Recipe {
    // sample implementation
    const recipe = RecipesUtils.create(newRecipeData, ctx.user);
    this.recipesCollection.push(recipe);
    return recipe;
  }
}
```

[note]
Bởi vì phương thức của chúng tôi là đồng bộ và trả về rõ ràng `Recipe`,
chúng tôi có thể bỏ qua `@Mutation()` chú thích loại.
[/note]

## Field resolvers

Queries và mutations không phải là loại resolve duy nhất. Chúng ta thường
tạo các `object type resolve` ( Ví dụ: khi một type `user` có một field `posts`) 
mà chúng ta phải giải quyết bằng cách tìm nạp dữ liệu quan hệ từ cơ sở dữ liệu.

Field resolvers in TNGraphQL rất giống với các Queries và Mutations - Chúng tôi tạo chúng
như một phương thức trên class resolve với một vài sửa đổi.

```ts
@Resolver(of => Recipe)
class RecipeResolver {
  // queries and mutations
}
```

Sau đó, chúng ta tạo một phương thức class sẽ trở thành trình `Field Resolve`. 
Trong ví dụ của chúng ta, chúng ta có `averageRating` trường trong `Recipe` loại đối tượng 
sẽ tính trung bình từ `ratings` mảng.

```ts
@Resolver(of => Recipe)
class RecipeResolver {
  // queries and mutations

  averageRating(recipe: Recipe) {
    // ...
  }
}
```

Sau đó chúng tôi đánh dấu phương thức là một trình phân giải trường với 
`@FieldResolver()`. Vì chúng ta đã định nghĩa loại trường trong `Recipe` định nghĩa class, 
nên không cần xác định lại loại đó. Chúng tôi cũng trang trí các tham số phương thức với 
trình trang trí `@Root` để tiêm đối tượng công thức.

```ts
@Resolver(of => Recipe)
class RecipeResolver {
  // queries and mutations

  @FieldResolver()
  averageRating(@Root() recipe: Recipe) {
    // ...
  }
}
```

Để tăng cường an toàn loại chúng ta có thể thực hiện interface `ResolverInterface<Recipe>`. 
Đó là một trình trợ giúp nhỏ kiểm tra xem kiểu trả về của các phương thức `FieldResove`, 
như `averageRating(...)`, có khớp với thuộc tính `averageRating` của 
class `Recipe` hay không và liệu tham số đầu tiên của phương thức có 
phải là loại đối tượng thực tế ( `Recipe` class) không.

```ts
@Resolver(of => Recipe)
class RecipeResolver implements ResolverInterface<Recipe> {
  // queries and mutations

  @FieldResolver()
  averageRating(@Root() recipe: Recipe) {
    // ...
  }
}
```

Dưới đây là toàn bộ thực hiện của `averageRating` field resolver:

```ts
@Resolver(of => Recipe)
class RecipeResolver implements ResolverInterface<Recipe> {
  // queries and mutations

  @FieldResolver()
  averageRating(@Root() recipe: Recipe) {
    const ratingsSum = recipe.ratings.reduce((a, b) => a + b, 0);
    return recipe.ratings.length ? ratingsSum / recipe.ratings.length : null;
  }
}
```

Đối với các trình phân giải đơn giản như `averageRating` các trường không dùng hoặc không dùng hành vi 
giống như các bí danh, 
bạn có thể tạo các field resolves theo định nghĩa object type:

```ts
@ObjectType()
class Recipe {
  @Field()
  title: string;

  @Field({ deprecationReason: "Use `title` instead" })
  get name(): string {
    return this.title;
  }

  @Field(type => [Rate])
  ratings: Rate[];

  @Field(type => Float, { nullable: true })
  averageRating(@Arg("since") sinceDate: Date): number | null {
    const ratings = this.ratings.filter(rate => rate.date > sinceDate);
    if (!ratings.length) return null;

    const ratingsSum = ratings.reduce((a, b) => a + b, 0);
    return ratingsSum / ratings.length;
  }
}
```

Tuy nhiên, nếu mã phức tạp hơn và có tác dụng phụ
(ví dụ như các cuộc gọi api, tìm nạp dữ liệu từ cơ sở dữ liệu),
nên sử dụng resolve class. 
Bằng cách này, chúng ta có thể tận dụng [dependency injection](), thực sự hữu ích trong thử nghiệm.
Ví dụ:

```ts
@Resolver(of => Recipe)
class RecipeResolver implements ResolverInterface<Recipe> {
  constructor(
    private userRepository: UserRepository<User>, // dependency injection
  ) {}

  @FieldResolver()
  async author(@Root() recipe: Recipe) {
    const author = await this.userRepository.findById(recipe.userId);
    if (!author) throw new SomethingWentWrongError();
    return author;
  }
}
```

[note]
Lưu ý rằng nếu tên trường của field resolves không tồn tại trong resolver object type, 
nó sẽ tạo một trường trong lược đồ có tên này. Tính năng này hữu ích khi trường hoàn toàn có thể tính 
toán được 
(ví dụ: `averageRating` từ mảng `ratings`) và để tránh gây ô nhiễm class signature.
[/note]

## Resolver Inheritance
Resolver class inheritance là một chủ đề nâng cao được đề cập trong [resolver inheritance docs]().