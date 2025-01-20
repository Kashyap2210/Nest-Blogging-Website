import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from 'src/blog/blog.module';
import { BlogService } from 'src/blog/service/blog.service';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsRepository } from 'src/comments/repository/comments.repository';
import { CommentsService } from 'src/comments/service/comments.service';
import { LikesCounterBlogRepository } from 'src/likes-counter-blogs/repository/likes-counter-blogs.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => BlogModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    BlogService,
    CommentsService,
    CommentsRepository,
    LikesCounterBlogsService,
    LikesCounterBlogRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {}
