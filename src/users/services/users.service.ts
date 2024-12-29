import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IUserUpdateDto } from '../dtos/user.update.dto';
import { UserEntity } from '../entities/user.entity';
import {
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
} from '../interfaces/entity.interface';
import { BlogService } from 'src/blog/service/blog.service';
import { UsersRepository } from '../repository/users.repository';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';

@Injectable()
export class UsersService extends EntityManagerBaseService<UserEntity> {
  constructor(
    private userRepository: UsersRepository,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
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
      const existingUserByEmailId = await this.userRepository.getByFilter(
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
      const existingUserByUsername = await this.userRepository.getByFilter(
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

    const userInstance = await this.userRepository.getInstance(
      dto,
      entityManager,
    );
    // console.log('this is the user instance from service', userInstance);
    // userInstance.createdBy = userInstance.updatedBy = 1;
    return this.userRepository.create(userInstance, entityManager);
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
    const allUsers = await this.userRepository.getByFilter({});
    let allUsersResponse: Partial<IUserEntityArray> = [];
    for (const user of allUsers) {
      delete user['password']; //Removing password from all the response
      allUsersResponse.push(user);
    }
    return allUsersResponse;
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    const [userByUsername] = await this.userRepository.getByFilter({
      username: [name],
    });
    // console.log(
    //   'this is the user by username from user service',
    //   userByUsername,
    // );
    return userByUsername;
  }

  async getUserByIdAuth(id: number): Promise<IUserEntity> {
    const [userById] = await this.userRepository.getByFilter({ id: [id] });
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
    const [userById] = await this.userRepository.getByFilter({ id: [id] });
    delete userById['password'];
    return userById;
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
    const [existingUser] = await this.userRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );

    //Check if user with same credentials exists via seperate method
    await this.checkUserExists(
      dto.emailId !== existingUser.emailId ? dto.emailId : undefined,
      dto.username !== existingUser.username ? dto.username : undefined,
      dto.contactNo !== existingUser.contactNo ? dto.contactNo : undefined,
      entityManager,
    );

    const updatedUser = {
      ...existingUser,
      ...(dto.name && { name: dto.name }),
      ...(dto.username && { username: dto.username }),
      ...(dto.password && { password: dto.password }),
      ...(dto.emailId && { emailId: dto.emailId }),
      ...(dto.contactNo && { contactNo: dto.contactNo }),
      ...(dto.profilePictureUrl && { profilePicture: dto.profilePictureUrl }),
    };
    const [updatedUserEntity] = await this.userRepository.updateById(
      id,
      updatedUser,
      entityManager,
    );
    return updatedUserEntity;
  }

  async deleteUserById(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    await this.userRepository.validatePresence('id', [id], 'id', entityManager);
    if (currentUser.role !== 'TOAA') {
      throw new ForbiddenException({
        key: 'user.role',
        message: 'Current user does not have permission to delete any user',
      });
    }
    await this.userRepository.deleteById(id);
  }
}
