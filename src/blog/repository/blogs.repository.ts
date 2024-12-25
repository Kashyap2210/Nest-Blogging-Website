import { EntityManager, EntityRepository } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogUpdateDto,
} from '../interfaces/blog.interfaces';
import { IUserEntity } from 'src/users/interfaces/entity.interface';

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
}
