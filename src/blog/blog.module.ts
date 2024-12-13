import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './service/blog.service';
import { UsersService } from 'src/users/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsService } from 'src/comments/comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity]),
    UsersModule,
    forwardRef(() => CommentsModule),
  ],
  // providers: [BlogService, UsersService, CommentsService],
  providers: [BlogService, UsersService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
