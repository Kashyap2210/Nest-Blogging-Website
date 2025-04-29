import { Injectable } from '@nestjs/common';
import { EntityManagerBaseService } from '@src/helpers/entity.repository';
import {
  IUserFolloweeEntity,
  IUserFollowerCreateDto
} from 'blog-common-1.0';
import { EntityManager } from 'typeorm';
import { FollowersEntity } from '../entities/followers.entity';

@Injectable()
export class FollowersEntityRepository extends EntityManagerBaseService<FollowersEntity> {
  getEntityClass(): new () => FollowersEntity {
    return FollowersEntity;
  }

  getInstance(
    dto: IUserFollowerCreateDto,
    entityManager?: EntityManager,
  ): FollowersEntity {
    return this.getRepository(entityManager).create(dto);
  }

  async create(
    dto: IUserFolloweeEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    return this.getRepository(entityManager).save(dto);
  }

  async update(
    id: number,
    dto: IUserFolloweeEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    await this.getRepository(entityManager).update(id, dto);
    return (await this.getByFilter({ id: [id] }, entityManager))[0];
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const isDeleted = await this.getRepository(entityManager).delete(id);
    return isDeleted.affected === 1 ? true : false;
  }
}
