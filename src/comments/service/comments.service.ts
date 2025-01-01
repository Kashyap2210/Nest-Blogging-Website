import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BlogService } from 'src/blog/service/blog.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ICommentUpdateDto } from '../dto/update-comment.dto';
import { CommentEntity } from '../entities/comment.entity';
import { ICommentEntity } from '../interfaces/comment.entity.interface';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { CommentsRepository } from '../repository/comments.repository';

@Injectable()
export class CommentsService extends EntityManagerBaseService<CommentEntity> {
  constructor(
    private commentRepository: CommentsRepository,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {
    super();
  }

  getEntityClass(): new () => CommentEntity {
    return CommentEntity;
  }

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
    await this.blogService.checkBlogPresence(
      createCommentDto.blogId,
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
      await this.commentRepository.validatePresence(
        'id',
        [createCommentDto.replyCommentId],
        'id',
        entityManager,
      );
    }
    const comment = await this.commentRepository.getInstance(
      createCommentDto,
      entityManager,
    );
    comment.authorId = comment.createdBy = comment.updatedBy = currentUser.id;
    return this.commentRepository.create(comment, entityManager);
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
    entityManager?: EntityManager,
  ): Promise<ICommentEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [commentToUpdate] = await this.commentRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
    if (
      commentToUpdate.createdBy !== currentUser.id &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'user.id',
        message: 'Current user cannot update this comment',
      });
    }
    const updatedComment = {
      ...commentToUpdate,
      ...dto,
      updatedBy: currentUser.id,
      updatedOn: new Date(),
    };
    return this.commentRepository.updateById(id, updatedComment);
  }

  async removeComment(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [commentToDelete] = await this.commentRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
    if (commentToDelete.createdBy !== currentUser.id && currentUser.role !== "TOAA") {
      throw new BadRequestException({
        key: 'user.id',
        message: 'Current user cannot delete this comment',
      });
    }
    await this.commentRepository.deleteById(id);
  }

  async findCommentsByBlogId(
    blogId: number,
    entityManager?: EntityManager,
  ): Promise<ICommentEntity[]> {
    return await this.commentRepository.getByFilter({blogId:[blogId]},entityManager);
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
    const commentToFind = await this.commentRepository.getByFilter({
      filter,
    });

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

  // async cascadeCommentDelete(blogId: number, entityManager?: EntityManager) {
  //   const comments = await this.commentRepository.validatePresence(
  //     'blogId',
  //     [blogId],
  //     'blogId',
  //     entityManager,
  //   );
  //   const commentIdsToDelete = comments.map((comment) => comment.id);
  //   return this.commentRepository.deleteMany(commentIdsToDelete);
  // }
}
