import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { EntityManager, EntityRepository } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { IBlogCreateDto, IBlogEntity } from 'blog-common-1.0';

@EntityRepository(BlogEntity)
export class BlogRepository extends EntityManagerBaseService<BlogEntity> {
  getEntityClass(): new () => BlogEntity {
    return BlogEntity;
  }

  async getInstance(
    dto: IBlogCreateDto,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    const blog = {
      title: dto.title,
      content: dto.content,
      author: 'currentUser',
      keywords: dto.keywords,
      createdBy: 1,
      updatedBy: 1,
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
  ): Promise<IBlogEntity[]> {
    await this.getRepository(entityManager).update(id, updateEntity);
    return this.getByFilter({ id: [id] }, entityManager);
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
