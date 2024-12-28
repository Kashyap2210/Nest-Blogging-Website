import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from 'typeorm';
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
    // @InjectRepository(UserEntity)
    private userRepository: UsersRepository,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {
    super();
  }

  getEntityClass(): new () => UserEntity {
    return UserEntity;
  }

  // async checkUserExists(
  //   emailId: string,
  //   username: string,
  //   contactNo: string,
  //   id?: number,
  // ): Promise<any> {
  //   const userByEmailId = await this.userRepository.findOne({
  //     where: { emailId: emailId },
  //   });
  //   if (userByEmailId && userByEmailId.id !== id) {
  //     throw new NotFoundException({
  //       key: 'User found with same email id',
  //       message: `User found with emailId: ${emailId}`,
  //     });
  //   }
  //   const userByUsername = await this.userRepository.findOne({
  //     where: { username: username },
  //   });
  //   if (userByUsername && userByUsername.id !== id) {
  //     throw new NotFoundException({
  //       key: 'User found with same username',
  //       message: `User found with username: ${username}`,
  //     });
  //   }
  //   const userByContactNo = await this.userRepository.findOne({
  //     where: { contactNo: contactNo },
  //   });
  //   if (userByContactNo && userByContactNo.id !== id) {
  //     throw new NotFoundException({
  //       key: 'User found with same contact number',
  //       message: `User found with contact number: ${contactNo}`,
  //     });
  //   }
  // }

  async createUser(
    dto: IUserCreateDto,
    // currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    // const existingUser = await this.checkUserExists(
    //   dto.emailId,
    //   dto.username,
    //   dto.contactNo,
    // );
    await this.userRepository.validatePresence(
      'emailId',
      [dto.emailId],
      'emailId',
      entityManager,
    );
    await this.userRepository.validatePresence(
      'username',
      [dto.username],
      'username',
      entityManager,
    );
    await this.userRepository.validatePresence(
      'contactNo',
      [dto.contactNo],
      'contactNo',
      entityManager,
    );
    const userInstance = await this.userRepository.getInstance(
      dto,
      entityManager,
    );
    userInstance.createdBy = userInstance.updatedBy = 1;
    return this.userRepository.create(userInstance, entityManager);
  }

  // async getAllUsers(currentUser: IUserEntity): Promise<IUserEntityArray> {
  //   if (!currentUser) {
  //     throw new BadRequestException({
  //       key: 'currentUser',
  //       message: 'current user is not logged in',
  //     });
  //   }
  //   if (currentUser.role !== 'TOAA') {
  //     throw new BadRequestException({
  //       key: 'currentUser',
  //       message: 'current user is not allowed to access this route',
  //     });
  //   }
  //   return this.userRepository.find();
  // }

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
    // ): Promise<IUserEntity> {
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    console.log('this is the user service response');
    // const existingUserById = await this.validatePresence(id);
    // if (
    //   existingUserById[0].id === currentUser.id ||
    //   existingUserById[0].role !== 'TOAA'
    // ) {
    //   throw new BadRequestException({
    //     key: 'id',
    //     message: `Current User Cannot Edit This Blog As He Did Not Create It`,
    //   });
    // }
    // const existingUser = await this.checkUserExists(
    //   dto.emailId,
    //   dto.username,
    //   dto.contactNo,
    //   id,
    // );
    // // if (userByEmailId && userByEmailId.id !== id) {
    // //   throw new ConflictException({
    // //     key: 'EmailAlreadyExists',
    // //     message: `A user with emailId ${dto.emailId} already exists.`,
    // //   });
    // // }

    // // if (userByUsername && userByUsername.id !== id) {
    // //   throw new ConflictException({
    // //     key: 'UsernameAlreadyExists',
    // //     message: `A user with username ${dto.username} already exists.`,
    // //   });
    // // }
    // // if (userByContactNo && userByContactNo.id !== id) {
    // //   throw new ConflictException({
    // //     key: 'ContactNoAlreadyExists',
    // //     message: `A user with contact number ${dto.contactNo} already exists.`,
    // //   });
    // // }
    // const updatedUser = {
    //   id: id,
    //   name: dto.name,
    //   username: dto.username,
    //   password: dto.password,
    //   emailId: dto.emailId,
    //   contactNo: dto.contactNo,
    //   profilePicture: dto.profilePictureUrl,
    //   gender: existingUserById[0].gender,
    // };
    // const updatedUserEntity = await this.userRepository.save(updatedUser);
    // return updatedUserEntity;
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
    // console.log(
    //   'this are all the blogs of the current User',
    //   allCurrentUsersBlogs,
    // );
    if (allCurrentUsersBlogs && allCurrentUsersBlogs.length > 0) {
      for (const blog of allCurrentUsersBlogs) {
        await this.blogService.deleteBlogById(blog.id, currentUser);
      }
    }

    return this.userRepository.deleteById(id);
    // return 'This User is deleted';
  }

  // async validatePresence(id: number): Promise<IUserEntity[]> {
  //   let user = await this.userRepository.findBy({ id });
  //   if (user.length === 0) {
  //     throw new BadRequestException({
  //       key: 'id',
  //       message: `User with id:${id} not found. Message from validate presence`,
  //     });
  //   }
  //   return user;
  // }
}
