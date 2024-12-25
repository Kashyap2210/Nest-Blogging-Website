import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogService } from 'src/blog/service/blog.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager, Repository } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ICommentUpdateDto } from '../dto/update-comment.dto';
import { CommentEntity } from '../entities/comment.entity';
import { ICommentEntity } from '../interfaces/comment.entity.interface';

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
    entityManager?: EntityManager,
  ): Promise<ICommentEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    // check to if blog exists, if yes then code proceeds
    await this.blogService.validatePresence(
      'id',
      [createCommentDto.blogId],
      'id',
      entityManager,
    );

    if (createCommentDto.isReplyComment) {
      if (!createCommentDto.replyCommentId) {
        throw new BadRequestException({
          key: 'replyCommentId',
          message: 'reply comment id must be present',
        });
      }

      // Check to see if parent comment exists
      await this.validateCommentPresence({
        parentCommentId: createCommentDto.replyCommentId,
      });
    }

    const newComment = {
      text: createCommentDto.text,
      authorId: currentUser.id,
      blogId: createCommentDto.blogId,
      isReplyComment: createCommentDto.isReplyComment ?? false,
      replyCommentId: createCommentDto.replyCommentId ?? null,
    };
    const comment = this.commentRepository.create(newComment);
    comment.createdBy = comment.updatedBy = currentUser.id;

    return this.commentRepository.save(comment);
  }

  /*
  async createRepeatComment(
    dto: ICommentCreateDto,
    currentUser: IUserEntity,
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogExists = await this.blogService.getBlogById(
      dto.blogId,
      currentUser,
    );
    console.log(blogExists);
    if (!blogExists) {
      throw new BadRequestException({
        key: 'blogId',
        message: `Blog with id: ${dto.blogId} does not exists`,
      });
    }
    const newReplyComment = {
      text: dto.text,
      authorId: currentUser.id,
      blogId: dto.blogId,
      isReplyComment: dto.isRepeatComment,
      replyCommentId: dto.repeatCommentId,
    };
    const replyComment = this.commentRepository.create(newReplyComment);
    replyComment.createdBy = replyComment.updatedBy = currentUser.name;
    return this, this.commentRepository.save(replyComment);
  }
*/
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
    const [commentToUpdate] = await this.validateCommentPresence({ id: id });
    if (
      commentToUpdate.authorId !== currentUser.id &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'userId',
        message: 'comment does not belong to current user',
      });
    }
    const updatedComment = {
      ...commentToUpdate,
      text: dto.text,
      updatedBy: currentUser.id,
      updatedOn: new Date(),
      authorId: currentUser.id,
    };
    return this.commentRepository.save(updatedComment);
  }

  async removeComment(id: number, currentUser: IUserEntity): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [commentToDelete] = await this.validateCommentPresence({ id: id });
    if (
      currentUser.id !== commentToDelete.authorId &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'userId',
        message: 'You are not authorized to delete this comment',
      });
    }
    await this.commentRepository.delete(id);
  }

  async findCommentsByBlogId(blogId: number): Promise<ICommentEntity[]> {
    return await this.validateCommentPresence({ blogId: blogId });
  }

  async validateCommentPresence(params: {
    id?: number;
    blogId?: number;
    parentCommentId?: number;
  }): Promise<ICommentEntity[]> {
    const { id, blogId, parentCommentId } = params;

    if (!id && !blogId && !parentCommentId) {
      throw new BadRequestException({
        key: 'missingParameters',
        message:
          'At least one identifier (id, blogId, or parentCommentId) must be provided.',
      });
    }

    const filter = id ? { id } : blogId ? { blogId } : { parentCommentId };
    const commentToFind = await this.commentRepository.findBy(filter);

    if (commentToFind.length === 0) {
      const errorKey = id ? 'commentId' : blogId ? 'blogId' : 'replyCommentId';
      const errorMessage = id
        ? `Comment with id ${id} not found.`
        : blogId
          ? `No comments found for blog with id ${blogId}.`
          : `Comment with id ${parentCommentId} does not exist.`;

      throw new BadRequestException({
        key: errorKey,
        message: errorMessage,
      });
    }
    return commentToFind;
  }

  async cascadeCommentDelete(blogId: number) {
    const comments = await this.validateCommentPresence({ blogId: blogId });
    const commentIdsToDelete = comments.map((comment) => comment.id);

    return this.commentRepository.delete(commentIdsToDelete);
  }
}
