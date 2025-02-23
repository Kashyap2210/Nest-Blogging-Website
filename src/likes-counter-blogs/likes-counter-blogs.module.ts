import { forwardRef, Module } from '@nestjs/common';
import { BlogModule } from 'src/blog/blog.module';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsRepository } from 'src/comments/repository/comments.repository';
import { CommentsService } from 'src/comments/service/comments.service';
import { UsersModule } from 'src/users/users.module';
import { LikesCounterBlogsController } from './controllers/likes-counter-blogs.controller';
import { LikesCounterBlogRepository } from './repository/likes-counter-blogs.repository';
import { LikesCounterBlogsService } from './services/likes-counter-blogs.service';
import { UserDeleteTransaction } from '@src/users/transactions/user_delete.transaction';
import { BlogDeleteTransaction } from '@src/blog/transactions/blog_delete_transaction';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => BlogModule),
    CommentsModule, //Comments module is imported here as the blogmodule has a dependency on it
  ],
  controllers: [LikesCounterBlogsController],
  providers: [
    LikesCounterBlogsService,
    LikesCounterBlogRepository,
    CommentsService,
    CommentsRepository,
    UserDeleteTransaction,
    BlogDeleteTransaction,
  ],
  exports: [LikesCounterBlogsService, LikesCounterBlogRepository],
})
export class LikesCounterBlogsModule {}
