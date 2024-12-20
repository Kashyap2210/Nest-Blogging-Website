import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from 'src/blog/blog.module';
import { UsersModule } from 'src/users/users.module';
import { CommentsController } from './controller/comments.controller';
import { CommentEntity } from './entities/comment.entity';
import { CommentsService } from './service/comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    UsersModule,
    forwardRef(() => BlogModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
