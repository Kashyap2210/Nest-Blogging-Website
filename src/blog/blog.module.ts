import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogEntity } from './entities/blog.entity';
import { BlogService } from './service/blog.service';
import { LikesCounterBlogsModule } from 'src/likes-counter-blogs/likes-counter-blogs.module';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsService } from 'src/comments/service/comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommentsModule),
    LikesCounterBlogsModule,
  ],
  providers: [
    BlogService,
    UsersService,
    LikesCounterBlogsService,
    CommentsService,
  ],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
