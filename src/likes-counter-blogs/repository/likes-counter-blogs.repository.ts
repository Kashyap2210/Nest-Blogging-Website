import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { EntityManager, EntityRepository } from 'typeorm';
import { BlogLikesCounterEntity } from '../entities/likes-counter-blog.entity';
import { IBlogLikeDto } from '../interfaces/create-blog-like.dto.interface';
import { IBlogLikesCounterEntity } from '../interfaces/blog-like-counter.interface';
import { LikeStatus } from '../enums/like.status.enum';
import { IUserEntity } from 'src/users/interfaces/entity.interface';

@EntityRepository(BlogLikesCounterEntity)
export class LikesCounterBlogRepository extends EntityManagerBaseService<BlogLikesCounterEntity> {
  getEntityClass(): new () => BlogLikesCounterEntity {
    return BlogLikesCounterEntity;
  }

  async getInstance(
    dto: IBlogLikeDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogLikesCounterEntity> {
    const blogLikesCounter = {
      blogId: dto.blogId,
      likedStatus: dto.likedStatus,
      likedBy: dto.likedStatus === LikeStatus.LIKED ? currentUser.id : null,
      disLikedBy:
        dto.likedStatus === LikeStatus.DISLIKED ? currentUser.id : null,
      createdBy: 1,
      updatedBy: 1,
    };
    return this.getRepository(entityManager).save(blogLikesCounter);
  }

  async create(
    dto: IBlogLikesCounterEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogLikesCounterEntity> {
    return this.getRepository(entityManager).save(dto);
  }

  async updateById(
    id: number,
    updateEntity: IBlogLikesCounterEntity,
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
