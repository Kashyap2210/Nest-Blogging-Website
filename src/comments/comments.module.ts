import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from 'src/blog/blog.module';
import { CommentsController } from './controller/comments.controller';
import { CommentEntity } from './entities/comment.entity';
import { CommentsService } from './service/comments.service';
import { UsersService } from 'src/users/services/users.service';
import { BlogService } from 'src/blog/service/blog.service';
import { UsersModule } from 'src/users/users.module';
import { CommentsRepository } from './repository/comments.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { LikesCounterBlogRepository } from 'src/likes-counter-blogs/repository/likes-counter-blogs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => BlogModule),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    UsersService,
    UsersRepository,
    BlogService,
    CommentsRepository,
    LikesCounterBlogsService,
    LikesCounterBlogRepository,
  ],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
