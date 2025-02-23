import { BadRequestException, Inject } from '@nestjs/common';
import { BlogService } from '@src/blog/service/blog.service';
import { CommentsService } from '@src/comments/service/comments.service';
import { LikesCounterBlogsService } from '@src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersRepository } from '@src/users/repository/users.repository';
import { DataSource } from 'typeorm';
import { IUserDeleteData } from './interfaces/user_delete_transaction_data.interface';

export class UserDeleteTransaction {
  constructor(
    private blogService: BlogService,
    private commentsService: CommentsService,
    private likesDislikesService: LikesCounterBlogsService,
    private readonly userRepository: UsersRepository,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  async executeDeleteTransaction(data: IUserDeleteData): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const entityManager = queryRunner.manager;

    try {
      const { userId, blogIds, commentIds, likeAndDislikesEntitiesIds } = data;

      if (blogIds.length > 0) {
        await this.blogService.deleteManyBlogs(blogIds, entityManager);
      }
      if (commentIds.length > 0) {
        await this.commentsService.deleteMany(commentIds, entityManager);
      }
      if (likeAndDislikesEntitiesIds.length > 0) {
        await this.likesDislikesService.deleteMany(
          likeAndDislikesEntitiesIds,
          entityManager,
        );
      }
      const deletedUser = await this.userRepository.deleteById(
        userId,
        entityManager,
      );
      await queryRunner.commitTransaction();
      return deletedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({
        key: 'transaction_error',
        message: 'Error during transaction',
      });
    } finally {
      await queryRunner.release();
    }
  }
}
