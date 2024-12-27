import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager, EntityRepository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { ICommentCreateDto } from '../interfaces/comment.create.interface';
import { ICommentEntity } from '../interfaces/comment.entity.interface';

@EntityRepository(CommentEntity)
export class CommentsRepository extends EntityManagerBaseService<CommentEntity> {
  getEntityClass(): new () => CommentEntity {
    return CommentEntity;
  }

  async getInstance(
    dto: ICommentCreateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<ICommentEntity> {
    const blog = {
      text: dto.text,
      authorId: currentUser.id,
      blogId: dto.blogId,
      isReplyComment: dto.isReplyComment,
      replyCommentId: dto.replyCommentId,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };
    return this.getRepository(entityManager).save(blog);
  }

  async create(
    comment: ICommentEntity,
    entityManager?: EntityManager,
  ): Promise<ICommentEntity> {
    return this.getRepository(entityManager).save(comment);
  }

  async updateById(
    id: number,
    updateEntity: ICommentEntity,
    entityManager?: EntityManager,
  ): Promise<any> {
    return this.getRepository(entityManager).update(id, updateEntity);
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }

  async deleteMany(id: number[], entityManager?: EntityManager): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
