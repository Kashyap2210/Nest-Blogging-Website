import { forwardRef, Module } from '@nestjs/common';
import { LikesCounterBlogsService } from './services/likes-counter-blogs.service';
import { LikesCounterBlogsController } from './controllers/likes-counter-blogs.controller';
import { UsersModule } from 'src/users/users.module';
import { BlogModule } from 'src/blog/blog.module';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsService } from 'src/comments/service/comments.service';
import { CommentsRepository } from 'src/comments/repository/comments.repository';
import { LikesCounterBlogRepository } from './repository/likes-counter-blogs.repository';

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
