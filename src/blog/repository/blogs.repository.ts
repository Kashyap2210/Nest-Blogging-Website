import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager, EntityRepository } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {
  IBlogCreateDto,
  IBlogEntity
} from '../interfaces/blog.interfaces';

@EntityRepository(BlogEntity)
export class BlogRepository extends EntityManagerBaseService<BlogEntity> {
  getEntityClass(): new () => BlogEntity {
    return BlogEntity;
  }

  async getInstance(
    dto: IBlogCreateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    const blog = {
      title: dto.title,
      content: dto.content,
      author: currentUser.name,
      keywords: dto.keywords,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };
    return this.getRepository(entityManager).save(blog);
  }

  async create(
    blog: IBlogEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    return this.getRepository(entityManager).save(blog);
  }

  async updateById(
    id: number,
    updateEntity: IBlogEntity,
    entityManager?: EntityManager,
  ): Promise<any> {
    return this.getRepository(entityManager).update(id, updateEntity);
  }

  async deleteById<P>(id: number, entityManager?: EntityManager): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
