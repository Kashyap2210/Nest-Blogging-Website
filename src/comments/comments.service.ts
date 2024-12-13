import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ICommentUpdateDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { ICommentEntity } from './interfaces/comment.entity.interface';
import { BlogService } from 'src/blog/service/blog.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    currentUser: IUserEntity,
  ): Promise<ICommentEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogExists = await this.blogService.getBlogById(
      createCommentDto.blogId,
      currentUser,
    );
    console.log(blogExists);
    if (!blogExists) {
      throw new BadRequestException({
        key: 'blogId',
        message: `Blog with id: ${createCommentDto.blogId} does not exists`,
      });
    }
    const newComment = {
      text: createCommentDto.text,
      authorId: currentUser.id,
      blogId: createCommentDto.blogId,
    };
    const comment = this.commentRepository.create(newComment);
    comment.createdBy = comment.updatedBy = currentUser.name;
    return this, this.commentRepository.save(comment);
  }

  async updateCommentById(
    id: number,
    dto: ICommentUpdateDto,
    currentUser: IUserEntity,
  ): Promise<ICommentEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const commentToUpdate = await this.commentRepository.findOneBy({ id });
    if (!commentToUpdate) {
      throw new BadRequestException({
        key: 'id',
        message: 'comment does not exists',
      });
    }
    if (commentToUpdate.authorId !== currentUser.id) {
      throw new BadRequestException({
        key: 'userId',
        message: 'comment does not belong to current user',
      });
    }
    const updatedComment = {
      ...commentToUpdate,
      text: dto.text,
      updatedBy: currentUser.name,
      updatedOn: new Date(),
      authorId: currentUser.id,
    };
    console.log(updatedComment);
    return this.commentRepository.save(updatedComment);
  }

  async removeComment(id: number, currentUser: IUserEntity): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [commentToDelete] = await this.commentRepository.findBy({ id });
    if (!commentToDelete) {
      throw new BadRequestException({
        key: 'commentId',
        message: `Comment with ${id} not found`,
      });
    }
    if (currentUser.id !== commentToDelete.authorId) {
      throw new BadRequestException({
        key: 'userId',
        message: 'You are not authorized to delete this comment',
      });
    }
    await this.commentRepository.delete(id);
  }

  async findCommentsByBlogId(blogId: number): Promise<ICommentEntity[]> {
    const blogComments = await this.commentRepository.findBy({ blogId });
    return blogComments;
  }
}
