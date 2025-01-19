import { forwardRef, Module } from '@nestjs/common';
import { BlogModule } from '@src/blog/blog.module';
import { CommentsModule } from '@src/comments/comments.module';
import { CommentsRepository } from '@src/comments/repository/comments.repository';
import { CommentsService } from '@src/comments/service/comments.service';
import { UsersModule } from '@src/users/users.module';
import { LikesCounterBlogsController } from './controllers/likes-counter-blogs.controller';
import { LikesCounterBlogRepository } from './repository/likes-counter-blogs.repository';
import { LikesCounterBlogsService } from './services/likes-counter-blogs.service';

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
  ],
  exports: [LikesCounterBlogsService, LikesCounterBlogRepository],
})
export class LikesCounterBlogsModule {}
