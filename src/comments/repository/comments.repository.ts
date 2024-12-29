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
    entityManager?: EntityManager,
  ): Promise<ICommentEntity> {
    const blog = {
      text: dto.text,
      authorId: 1,
      blogId: dto.blogId,
      isReplyComment: dto.isReplyComment,
      replyCommentId: dto.replyCommentId,
      createdBy: 1,
      updatedBy: 1,
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
    await this.getRepository(entityManager).update(id, updateEntity);
    return this.getByFilter({ id: [id] });
  }

  async deleteById(id: number, entityManager?: EntityManager): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }

  async deleteMany(id: number[], entityManager?: EntityManager): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
