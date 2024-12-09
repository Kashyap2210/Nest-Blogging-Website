import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { ICommentEntity } from './interfaces/comment.entity.interface';

@Injectable()
export class CommentsService {
  // constructor(
  //   @InjectRepository(BlogEntity)
  //   private blogRepository: Repository<BlogEntity>,
  // ) {}

  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  create(
    createCommentDto: CreateCommentDto,
    currentUser: IUserEntity,
  ): Promise<ICommentEntity> {
    const newComment = {
      text: createCommentDto.text,
      author: currentUser.name,
      blogId: createCommentDto.blogId,
    };
    const comment = this.commentRepository.create(newComment);
    console.log("this is the current user",currentUser);
    comment.createdBy = comment.updatedBy = currentUser.name;
    return this, this.commentRepository.save(comment);
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
