import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '@src/users/services/users.service';
import {
  IFollowersStatusFlowConfig,
  IUserEntity,
  IUserFolloweeEntity,
  IUserFolloweeResponse,
  IUserFollowerCreateDto,
  IUserFollowerSearchDto,
  IUserFollowerUpdateDto,
} from 'blog-common-1.0';
import { EntityManager } from 'typeorm';
import { FollowersCreateDto } from '../dtos/followers.create.dto';
import { FollowersUpdateDto } from '../dtos/followers.update.dto';
import { FollowersEntity } from '../entities/followers.entity';
import { FollowersStatusFlowConfig } from '../followers.flow.config';
import { FollowersEntityRepository } from '../repository/followers.repository';

@Injectable()
export class FollowersService {
  constructor(
    private readonly followersRepository: FollowersEntityRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  getInstance(
    dto: IUserFollowerCreateDto,
    entityManager?: EntityManager,
  ): FollowersEntity {
    return this.followersRepository.getInstance(dto, entityManager);
  }

  async create(
    dto: FollowersCreateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    await this.validateCreateDtoDetails(currentUser, dto, entityManager);

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
    dto: FollowersUpdateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeEntity> {
    this.validateUpdateDtoDetails(currentUser, dto);

    const [existingEntity] = await this.validatePresence(id, entityManager);
    dto.status = this.getNextStatusForFollowerEntity(
      FollowersStatusFlowConfig,
      dto,
    );
    delete dto.action;
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
    this.validateDeleteDetails(id, currentUser, entityManager);
    return this.followersRepository.deleteById(id, entityManager);
  }

  async getFollowersByFilter(
    filters: IUserFollowerSearchDto,
    entityManager?: EntityManager,
  ): Promise<IUserFolloweeResponse[]> {
    const followersAndFollowingOfUser =
      await this.followersRepository.getByFilter(filters, entityManager);
    // console.log('followersAndFollowingOfUser', followersAndFollowingOfUser);

    if (filters.userId) {
      const followers = await this.userService.getUserByFilter(
        {
          id: followersAndFollowingOfUser.map((user) => user.followeeUserId),
        },
        entityManager,
      );
      return followers;
    } else {
      const following = await this.userService.getUserByFilter(
        {
          id: followersAndFollowingOfUser.map((user) => user.userId),
        },
        entityManager,
      );
      return following;
    }
  }

  getNextStatusForFollowerEntity(
    flowConfig: IFollowersStatusFlowConfig,
    dto: IUserFollowerUpdateDto,
  ) {
    return flowConfig[dto.action].next();
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

  private async validateCreateDtoDetails(
    currentUser: IUserEntity,
    dto: FollowersCreateDto,
    entityManager: EntityManager,
  ) {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const dtoErrors = dto.validate();
    if (dtoErrors && dtoErrors.length > 0) {
      throw new BadRequestException({
        key: dtoErrors[0].key,
        message: dtoErrors[0].message,
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
  }

  private validateUpdateDtoDetails(
    currentUser: IUserEntity,
    dto: FollowersUpdateDto,
  ) {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const dtoErrors = dto.validate();
    if (dtoErrors && dtoErrors.length > 0) {
      throw new BadRequestException({
        key: dtoErrors[0].key,
        message: dtoErrors[0].message,
      });
    }
  }

  private async validateDeleteDetails(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ) {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    await this.validatePresence(id, entityManager);
  }
}
