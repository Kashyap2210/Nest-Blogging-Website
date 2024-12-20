import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogEntity } from './entities/blog.entity';
import { BlogService } from './service/blog.service';
import { CommentsService } from 'src/comments/service/comments.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity]),
    UsersModule,
    forwardRef(() => CommentsModule),
  ],
  providers: [BlogService, UsersService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
