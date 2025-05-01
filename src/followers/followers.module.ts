import { forwardRef, Module } from '@nestjs/common';
import { FollowersController } from './controller/followers.controller';
import { FollowersService } from './service/followers.service';
import { FollowersEntityRepository } from './repository/followers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowersEntity } from './entities/followers.entity';
import { UsersModule } from '@src/users/users.module';
import { UsersService } from '@src/users/services/users.service';
import { BlogModule } from '@src/blog/blog.module';
import { CommentsModule } from '@src/comments/comments.module';
import { LikesCounterBlogsModule } from '@src/likes-counter-blogs/likes-counter-blogs.module';
import { BlogService } from '@src/blog/service/blog.service';
import { LikesCounterBlogsService } from '@src/likes-counter-blogs/services/likes-counter-blogs.service';
import { CommentsService } from '@src/comments/service/comments.service';
import { DeleteUserWithinTransaction } from '@src/users/transactions/user_delete.transaction';
import { BlogCacheService } from '@src/blog/service/blog.cache.service';
import { DeleteBlogWithinTransaction } from '@src/blog/transactions/blog_delete_transaction';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowersEntity]),
    forwardRef(() => UsersModule),
    BlogModule,
    CommentsModule,
    LikesCounterBlogsModule,
  ],
  controllers: [FollowersController],
  providers: [
    FollowersService,
    FollowersEntityRepository,
    UsersService,
    DeleteUserWithinTransaction,
    BlogService,
    BlogCacheService,
    DeleteBlogWithinTransaction,
    LikesCounterBlogsService,
    CommentsService,
  ],
  exports: [FollowersService],
})
export class FollowersModule {}
