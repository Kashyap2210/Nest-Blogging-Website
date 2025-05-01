import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCacheService } from '@src/blog/service/blog.cache.service';
import { DeleteBlogWithinTransaction } from '@src/blog/transactions/blog_delete_transaction';
import { FollowersModule } from '@src/followers/followers.module';
import { FollowersService } from '@src/followers/service/followers.service';
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
import { DeleteUserWithinTransaction } from './transactions/user_delete.transaction';
import { FollowersEntityRepository } from '@src/followers/repository/followers.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => BlogModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => FollowersModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    BlogService,
    BlogCacheService,
    CommentsService,
    CommentsRepository,
    LikesCounterBlogsService,
    LikesCounterBlogRepository,
    DeleteUserWithinTransaction,
    DeleteBlogWithinTransaction,
    FollowersService,
    FollowersEntityRepository,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
