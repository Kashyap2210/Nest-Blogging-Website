import { BadRequestException, Injectable } from '@nestjs/common';
import { BlogService } from '@src/blog/service/blog.service';
import { CommentsService } from '@src/comments/service/comments.service';
import { LikesCounterBlogsService } from '@src/likes-counter-blogs/services/likes-counter-blogs.service';
import { UsersService } from '@src/users/services/users.service';
import {
  IUserEntity,
  IUserFolloweeEntity,
  IUserFollowerCreateDto,
  IUserFollowerSearchDto,
  IUserFollowerUpdateDto,
} from 'blog-common-1.0';
import { EntityManager } from 'typeorm';
import { FollowersEntity } from '../entities/followers.entity';
import { FollowersEntityRepository } from '../repository/followers.repository';

@Injectable()
export class FollowersService {
  constructor(
    private readonly followersRepository: FollowersEntityRepository,
    private readonly userService: UsersService,
    private blogService: BlogService,
    private commentsService: CommentsService,
    private likesCounterService: LikesCounterBlogsService,
  ) {}

  getInstance(
    dto: IUserFollowerCreateDto,
    entityManager?: EntityManager,
  ): FollowersEntity {
    return this.followersRepository.getInstance(dto, entityManager);
  }

  async create(
    dto: IUserFollowerCreateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    // validate users. need DI for user service
    await this.userService.validatePresence(
      'id',
      [dto.userId, dto.followeeUserId],
      'id',
      entityManager,
    );

    // validate if the follower entity does already exists
    const followerEntity = await this.getFollowersByFilter(
      {
        userId: [dto.userId],
        followeeUserId: [dto.followeeUserId],
      },
      entityManager,
    );
    if (followerEntity.length > 0) {
      throw new BadRequestException({
        key: 'userId, followerId',
        message: `You already follow this account `,
      });
    }

    const followerEntityInstance = this.followersRepository.getInstance(
      dto,
      entityManager,
    );
    followerEntityInstance.createdBy = followerEntityInstance.updatedBy =
      currentUser.id;
    return this.followersRepository.create(
      followerEntityInstance,
      entityManager,
    );
  }

  async updateById(
    id: number,
    dto: IUserFollowerUpdateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [existingEntity] = await this.validatePresence(id, entityManager);

    const updatedEntity: IUserFolloweeEntity = {
      ...existingEntity,
      ...dto,
      updatedOn: new Date(),
      updatedBy: currentUser.id,
    };

    return this.followersRepository.update(id, updatedEntity, entityManager);
  }

  async deleteById(
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
    await this.validatePresence(id, entityManager);
    return this.followersRepository.deleteById(id, entityManager);
  }

  async getFollowersByFilter(
    filters: IUserFollowerSearchDto,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity[]> {
    return this.followersRepository.getByFilter(filters, entityManager);
  }

  async validatePresence(
    id: number,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity[]> {
    return this.followersRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
  }
}
