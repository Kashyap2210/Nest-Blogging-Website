import { forwardRef, Module } from '@nestjs/common';
import { LikesCounterBlogsService } from './services/likes-counter-blogs.service';
import { LikesCounterBlogsController } from './controllers/likes-counter-blogs.controller';
import { UsersModule } from 'src/users/users.module';
import { BlogModule } from 'src/blog/blog.module';
import { BlogService } from 'src/blog/service/blog.service';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => BlogModule),
    CommentsModule, //Comments module is imported here as the blogmodule has a dependency on it
  ],
  controllers: [LikesCounterBlogsController],
  providers: [LikesCounterBlogsService],
})
export class LikesCounterBlogsModule {}
