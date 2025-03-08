import { forwardRef, Inject } from '@nestjs/common';
import { CommentsService } from '@src/comments/service/comments.service';
import { BaseTransaction } from '@src/helpers/base.transaction';
import { LikesCounterBlogsService } from '@src/likes-counter-blogs/services/likes-counter-blogs.service';
import { IBlogLikesCounterEntity, ICommentEntity } from 'blog-common-1.0';
import { DataSource, EntityManager } from 'typeorm';
import { BlogRepository } from '../repository/blogs.repository';
import { IBlogDeleteData } from './interfaces/blog_entity_delete_transaction.interface';

export class DeleteBlogWithinTransaction extends BaseTransaction<
  IBlogDeleteData,
  boolean
> {
  constructor(
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
    private likesDislikesService: LikesCounterBlogsService,
    private blogRepository: BlogRepository,
    @Inject(DataSource) dataSource: DataSource,
  ) {
    super(dataSource);
  }

  protected async execute(
    data: IBlogDeleteData,
    manager: EntityManager,
  ): Promise<boolean> {
    const { blogId, commentIds, likeDislikeEntityIds } = data;

    if (commentIds.length > 0) {
      await this.commentsService.deleteMany<ICommentEntity>(
        commentIds,
        manager,
      );
    }

    if (likeDislikeEntityIds.length > 0) {
      await this.likesDislikesService.deleteMany<IBlogLikesCounterEntity>(
        likeDislikeEntityIds,
        manager,
      );
    }

    return this.blogRepository.deleteById(blogId, manager);
  }
}

/*
export class DeleteBlogWithinTransaction {
  constructor(
    private commentsService: CommentsService,
    private likesDislikesService: LikesCounterBlogsService,
    private blogRepository: BlogRepository,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}
  async executeDeleteTransaction(data: IBlogDeleteData): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const entityManager = queryRunner.manager;
    try {
      const { blogId, commentIds, likeDislikeEntityIds } = data;

      if (commentIds.length > 0) {
        await this.commentsService.deleteMany<ICommentEntity>(
          commentIds,
          entityManager,
        );
      }

      if (likeDislikeEntityIds.length > 0) {
        await this.likesDislikesService.deleteMany<IBlogLikesCounterEntity>(
          likeDislikeEntityIds,
          entityManager,
        );
      }

      const deletedBlog = await this.blogRepository.deleteById(
        blogId,
        entityManager,
      );

      await queryRunner.commitTransaction();
      return deletedBlog;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({
        key: 'transaction_error',
        message: 'Error during Delete Blog transaction',
      });
    } finally {
      await queryRunner.release();
    }
  }
}
*/
