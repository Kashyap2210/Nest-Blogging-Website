import { forwardRef, Module } from '@nestjs/common';
import { LikesCounterBlogsService } from './services/likes-counter-blogs.service';
import { LikesCounterBlogsController } from './controllers/likes-counter-blogs.controller';
import { UsersModule } from 'src/users/users.module';
import { BlogModule } from 'src/blog/blog.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => BlogModule),
    CommentsModule, //Comments module is imported here as the blogmodule has a dependency on it
  ],
  controllers: [LikesCounterBlogsController],
  providers: [LikesCounterBlogsService],
  exports: [LikesCounterBlogsService],
})
export class LikesCounterBlogsModule {}
