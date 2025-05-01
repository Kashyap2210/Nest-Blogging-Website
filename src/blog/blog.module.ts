import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsService } from 'src/comments/service/comments.service';
import { LikesCounterBlogsModule } from 'src/likes-counter-blogs/likes-counter-blogs.module';
import { LikesCounterBlogRepository } from 'src/likes-counter-blogs/repository/likes-counter-blogs.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogEntity } from './entities/blog.entity';
import { BlogRepository } from './repository/blogs.repository';
import { BlogService } from './service/blog.service';
import { DeleteBlogWithinTransaction } from './transactions/blog_delete_transaction';
import { DeleteUserWithinTransaction } from '@src/users/transactions/user_delete.transaction';
import { BlogCacheService } from './service/blog.cache.service';
import { FollowersService } from '@src/followers/service/followers.service';
import { FollowersModule } from '@src/followers/followers.module';
import { FollowersEntityRepository } from '@src/followers/repository/followers.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommentsModule),
    LikesCounterBlogsModule,
    forwardRef(()=> FollowersModule)
  ],
  providers: [
    BlogService,
    BlogCacheService,
    UsersService,
    UsersRepository,
    LikesCounterBlogsService,
    LikesCounterBlogRepository,
    CommentsService,
    BlogRepository,
    DeleteUserWithinTransaction,
    DeleteBlogWithinTransaction,
    FollowersService, FollowersEntityRepository
  ],
  controllers: [BlogController],
  exports: [BlogService, BlogRepository],
})
export class BlogModule {}
