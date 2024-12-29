import {
  BadRequestException,
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
    emailId: string,
    username: string,
    contactNo: string,
    entityManager?: EntityManager,
  ): Promise<void> {
    await this.userRepository.validatePresence(
      'emailId',
      [emailId],
      'emailId',
      entityManager,
    );
    await this.userRepository.validatePresence(
      'username',
      [username],
      'username',
      entityManager,
    );
    await this.userRepository.validatePresence(
      'contactNo',
      [contactNo],
      'contactNo',
      entityManager,
    );
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
    userInstance.createdBy = userInstance.updatedBy = 1;
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
    const allUsers = await this.userRepository.getByFilter({});
    let allUsersResponse: Partial<IUserEntityArray> = [];
    for (const user of allUsers) {
      delete user['password'];  //Removing password from all the response
      allUsersResponse.push(user);
    }
    return allUsersResponse;
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    return this.userRepository.getByFilter({ username: [name] })[0];
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
    // ): Promise<IUserEntity> {
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [existingUserById] = await this.userRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );

    //Check if user with same contact number exists via seperate method
    await this.checkUserExists(dto.emailId, dto.username, dto.contactNo);

    const updatedUser = {
      ...existingUserById,
      id: id,
      name: dto.name,
      username: dto.username,
      password: dto.password,
      emailId: dto.emailId,
      contactNo: dto.contactNo,
      profilePicture: dto.profilePictureUrl,
      gender: existingUserById[0].gender,
    };
    const updatedUserEntity = await this.userRepository.updateById(
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
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    await this.userRepository.validatePresence('id', [id], 'id', entityManager);
    //using getByFilter here because we dont want an exception that is thrown in validate presence
    const allCurrentUsersBlogs =
      await this.blogService.getByFilter(currentUser);

    if (allCurrentUsersBlogs && allCurrentUsersBlogs.length > 0) {
      for (const blog of allCurrentUsersBlogs) {
        await this.blogService.deleteBlogById(blog.id, currentUser);
      }
    }

    return this.userRepository.deleteById(id);
  }
}
