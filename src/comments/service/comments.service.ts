import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICommentEntity,
  ICommentUpdateDto,
  IUserEntity,
} from 'blog-common-1.0';
import { BlogService } from 'src/blog/service/blog.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { EntityManager } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentEntity } from '../entities/comment.entity';
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

    if (createCommentDto.text.trim().length === 0) {
      throw new BadRequestException({
        key: 'text',
        message: 'Comment cannot be empty',
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
    const comment: ICommentEntity = await this.commentRepository.getInstance(
      createCommentDto,
      entityManager,
    );
    comment.authorId = comment.createdBy = comment.updatedBy = currentUser.id;
    return this.commentRepository.create(comment, entityManager);
  }

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
    const [commentToUpdate]: ICommentEntity[] =
      await this.commentRepository.validatePresence(
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
    const updatedComment: ICommentEntity = {
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
  ): Promise<boolean> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [commentToDelete]: ICommentEntity[] =
      await this.commentRepository.validatePresence(
        'id',
        [id],
        'id',
        entityManager,
      );
    if (
      commentToDelete.createdBy !== currentUser.id &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'user.id',
        message: 'Current user cannot delete this comment',
      });
    }
    const allComments = async (parentCommentId: number): Promise<number[]> => {
      const replies: ICommentEntity[] =
        await this.commentRepository.getByFilter(
          {
            replyCommentId: parentCommentId,
          },
          entityManager,
        );
      let allReplies: number[] = replies.map((reply) => reply.id);
      for (const reply of allReplies) {
        const childReplies: number[] = await allComments(reply);
        allReplies.push(...childReplies);
      }
      return allReplies;
    };
    let uniqueReplyCommentArray: number[] = [];
    uniqueReplyCommentArray = Array.from(new Set(await allComments(id)));
    uniqueReplyCommentArray.push(id);

    return await this.commentRepository.deleteMany(
      uniqueReplyCommentArray,
      entityManager,
    );
  }

  async findCommentsByBlogId(
    blogId: number[],
    entityManager?: EntityManager,
  ): Promise<ICommentEntity[]> {
    return await this.commentRepository.getByFilter(
      { blogId: blogId },
      entityManager,
    );
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
    const commentToFind: ICommentEntity[] =
      await this.commentRepository.getByFilter({
        filter,
      });

    if (commentToFind.length === 0) {
      const errorKey = id ? 'commentId' : blogId ? 'blogId' : 'replyCommentId';
      const errorMessage: string = id
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
}
