const higlight = require('./extensions/highlight')
const args = process.argv.splice(2)

function wrapPre (code) {
  return `<pre><code>${code}</code></pre>`
}


if (args[0] === '1') {
  console.log(wrapPre(higlight(`
@Resolver()
export class PostResolve extends BaseResolve {
    @Query(returns => [UserType])
    async index() {
        return Post.all()
    }
    
    @Mutation(returns => UserType)
    async store(@Args() data: PostArgs) {
        const post = await Post.create(data)

        return post
    }
}
`,
    'language-ts'
  )))
}

if (args[0] === '2') {
  console.log(wrapPre(higlight(`import { Route } from '@tngraphql/illuminate/dist/Support/Facades';

Route.query('posts', 'PostResolve.index');
Route.mutation('createPost', 'PostResolve.store')
  `,
    'language-ts'
  )))
}

if (args[0] === '3') {
  console.log(wrapPre(higlight(`import { column } from '@tngraphql/lucid/build/src/Orm/Decorators';
import { BaseModel } from '@tngraphql/lucid/build/src/Orm/BaseModel';

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public body: string
}`,
    'language-ts'
  )))
}
