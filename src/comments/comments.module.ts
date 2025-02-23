import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogDeleteTransaction } from '@src/blog/transactions/blog_delete_transaction';
import { UserDeleteTransaction } from '@src/users/transactions/user_delete.transaction';
import { BlogModule } from 'src/blog/blog.module';
import { BlogService } from 'src/blog/service/blog.service';
import { LikesCounterBlogRepository } from 'src/likes-counter-blogs/repository/likes-counter-blogs.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { CommentsController } from './controller/comments.controller';
import { CommentEntity } from './entities/comment.entity';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsService } from './service/comments.service';

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
    UserDeleteTransaction,
    BlogDeleteTransaction,
  ],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
