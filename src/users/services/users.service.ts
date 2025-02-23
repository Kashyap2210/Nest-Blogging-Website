import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserDeleteTransaction } from '@src/users/transactions/user_delete.transaction';
import * as bcrypt from 'bcrypt';
import {
  IBlogEntitySearchDto,
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
  IUserUpdateDto,
} from 'blog-common-1.0';
import { BlogService } from 'src/blog/service/blog.service';
import { CommentsService } from 'src/comments/service/comments.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UsersRepository } from '../repository/users.repository';
import { IUserDeleteData } from '../transactions/interfaces/user_delete_transaction_data.interface';

@Injectable()
export class UsersService extends EntityManagerBaseService<UserEntity> {
  constructor(
    private userRepository: UsersRepository,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
    private commentsService: CommentsService,
    private likesCounterService: LikesCounterBlogsService,
    private userDeleteTransaction: UserDeleteTransaction,
  ) {
    super();
  }

  getEntityClass(): new () => UserEntity {
    return UserEntity;
  }

  async checkUserExists(
    emailId?: string,
    username?: string,
    contactNo?: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    if (emailId && emailId !== undefined && emailId !== null) {
      const existingUserByEmailId: IUserEntity[] =
        await this.userRepository.getByFilter(
          { emailId: [emailId] },
          entityManager,
        );
      // Check if the user already exists
      if (existingUserByEmailId.length > 0) {
        throw new BadRequestException({
          key: 'emailId',
          message: `User with emailId: ${emailId} already exists`,
        });
      }
    }

    if (username && username !== undefined && username !== null) {
      const existingUserByUsername: IUserEntity[] =
        await this.userRepository.getByFilter(
          { username: [username] },
          entityManager,
        );
      // Check if the user already exists
      if (existingUserByUsername.length > 0) {
        throw new BadRequestException({
          key: 'username',
          message: `User with username: ${username} already exists`,
        });
      }
    }

    if (contactNo && contactNo !== undefined && contactNo !== null) {
      const existingUserByContactNo = await this.userRepository.getByFilter(
        { contactNo: [contactNo] },
        entityManager,
      );
      // Check if the user already exists
      if (existingUserByContactNo.length > 0) {
        throw new BadRequestException({
          key: 'contactNo',
          message: `User with contactNo: ${contactNo} already exists`,
        });
      }
    }
    return false;
  }

  async createUser(
    dto: IUserCreateDto,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    //checking if user already exists via seperate method
    await this.checkUserExists(dto.emailId, dto.username, dto.contactNo);

    const userInstance: IUserEntity = await this.userRepository.getInstance(
      dto,
      entityManager,
    );
    // console.log('this is the user instance from service', userInstance);
    // userInstance.createdBy = userInstance.updatedBy = 1;
    return await this.userRepository.create(userInstance, entityManager);
  }

  async getAllUsers(
    currentUser: IUserEntity,
  ): Promise<Partial<IUserEntityArray>> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    if (currentUser.role !== 'TOAA') {
      throw new ForbiddenException({
        key: 'user.role',
        message: 'Current user does not have permission to access all users',
      });
    }
    const allUsers: IUserEntity[] = await this.userRepository.getByFilter({});
    let allUsersResponse: Partial<IUserEntityArray> = [];
    for (const user of allUsers) {
      delete user['password']; //Removing password from all the response
      allUsersResponse.push(user);
    }
    return allUsersResponse;
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    const [userByUsername]: IUserEntity[] =
      await this.userRepository.getByFilter({
        username: [name],
      });
    // console.log(
    //   'this is the user by username from user service',
    //   userByUsername,
    // );
    return userByUsername;
  }

  async getUserByIdAuth(id: number): Promise<IUserEntity> {
    const [userById]: IUserEntity[] = await this.userRepository.getByFilter({
      id: [id],
    });
    delete userById['password'];
    return userById;
  }

  async getUserById(
    id: number,
    currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [userById]: IUserEntity[] = await this.userRepository.getByFilter({
      id: [id],
    });
    delete userById['password'];
    return userById;
  }

  async getUserByFilter(
    filter: IBlogEntitySearchDto,
    entityManager?: EntityManager,
  ): Promise<IUserEntity[]> {
    return this.userRepository.getByFilter(filter, entityManager);
  }

  async updateUserById(
    id: number,
    dto: IUserUpdateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [existingUser]: IUserEntity[] =
      await this.userRepository.validatePresence(
        'id',
        [id],
        'id',
        entityManager,
      );

    // Check if the user editing is the same user that is updated or has the role of "TOAA"
    // console.log('this is the creent user id', currentUser.id);
    if (existingUser.id !== currentUser.id && currentUser.role !== 'TOAA') {
      throw new BadRequestException({
        key: 'currentUser',
        message: `Current User with id: ${id} does not have permission to update this user.`,
      });
    }

    //Check if user with same credentials exists via seperate method
    await this.checkUserExists(
      dto.emailId !== existingUser.emailId ? dto.emailId : undefined,
      dto.username !== existingUser.username ? dto.username : undefined,
      dto.contactNo !== existingUser.contactNo ? dto.contactNo : undefined,
      entityManager,
    );
    let hashedPassword: string;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }
    const updatedUser: IUserEntity = {
      ...existingUser,
      ...(dto.name && { name: dto.name }),
      ...(dto.username && { username: dto.username }),
      ...(dto.emailId && { emailId: dto.emailId }),
      ...(dto.contactNo && { contactNo: dto.contactNo }),
      ...(dto.profilePictureUrl && { profilePicture: dto.profilePictureUrl }),
      password: dto.password ? hashedPassword : existingUser.password,
    };
    const [updatedUserEntity]: IUserEntity[] =
      await this.userRepository.updateById(id, updatedUser, entityManager);
    return updatedUserEntity;
  }

  async deleteUserById(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    if (currentUser.role !== 'TOAA') {
      // console.log('code is reaching here', 4);
      throw new ForbiddenException({
        key: 'user.role',
        message: 'Current user does not have permission to delete any user',
      });
    }

    const currentUserBlogsIds: number[] = (
      await this.blogService.getByFilter({ createdBy: [id] }, entityManager)
    ).map((blog) => blog.id);

    // console.log('These are all the current user blogs', currentUserBlogsIds);

    const commentIdsOfMultipleBlogsByCurrentUser = (
      await this.commentsService.getCommentsByFilter(
        { createdBy: [id] },
        entityManager,
      )
    ).map((entity) => entity.id);

    const likeDislikeEntityIdsByCurrentuser = (
      await this.likesCounterService.getLikeDislikeEntitiesByFilter(
        { createdBy: [id] },
        entityManager,
      )
    ).map((entity) => entity.id);

    const data: IUserDeleteData = {
      userId: id,
      blogIds: currentUserBlogsIds,
      commentIds: commentIdsOfMultipleBlogsByCurrentUser,
      likeAndDislikesEntitiesIds: likeDislikeEntityIdsByCurrentuser,
    };

    return this.userDeleteTransaction.executeDeleteTransaction(data);
  }
}
