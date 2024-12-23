import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { IUserUpdateDto } from '../dtos/user.update.dto';
import { UserEntity } from '../entities/user.entity';
import {
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
} from '../interfaces/entity.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async checkUserExists(
    emailId: string,
    username: string,
    contactNo: string,
    id?: number,
  ): Promise<any> {
    const userByEmailId = await this.userRepository.findOne({
      where: { emailId: emailId },
    });
    if (userByEmailId && userByEmailId.id !== id) {
      throw new NotFoundException({
        key: 'User found with same email id',
        message: `User found with emailId: ${emailId}`,
      });
    }
    const userByUsername = await this.userRepository.findOne({
      where: { username: username },
    });
    if (userByUsername && userByUsername.id !== id) {
      throw new NotFoundException({
        key: 'User found with same username',
        message: `User found with username: ${username}`,
      });
    }
    const userByContactNo = await this.userRepository.findOne({
      where: { contactNo: contactNo },
    });
    if (userByContactNo && userByContactNo.id !== id) {
      throw new NotFoundException({
        key: 'User found with same contact number',
        message: `User found with contact number: ${contactNo}`,
      });
    }
  }

  async createUser(
    dto: IUserCreateDto,
    // currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    const existingUser = await this.checkUserExists(
      dto.emailId,
      dto.username,
      dto.contactNo,
    );
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    dto['password'] = hashedPassword;
    const user = this.userRepository.create(dto);
    user.profilePictureUrl = dto.profilePictureUrl;
    user.createdBy = user.updatedBy = 1;
    return this.userRepository.save(user);
  }

  async getAllUsers(currentUser: IUserEntity): Promise<IUserEntityArray> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    if (currentUser.role !== 'TOAA') {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not allowed to access this route',
      });
    }
    return this.userRepository.find();
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    return this.userRepository.findOne({ where: { username: name } });
  }

  async getUserByIdAuth(userId: number): Promise<IUserEntity> {
    const [userById] = await this.validatePresence(userId);
    delete userById['password'];
    return userById;
  }

  async getUserById(
    userId: number,
    currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [userById] = await this.validatePresence(userId);
    delete userById['password'];
    return userById;
  }

  async updateUserById(
    id: number,
    dto: IUserUpdateDto,
    currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const existingUserById = await this.validatePresence(id);
    if (
      existingUserById[0].id === currentUser.id ||
      existingUserById[0].role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'id',
        message: `Current User Cannot Edit This Blog As He Did Not Create It`,
      });
    }
    const existingUser = await this.checkUserExists(
      dto.emailId,
      dto.username,
      dto.contactNo,
      id,
    );
    // if (userByEmailId && userByEmailId.id !== id) {
    //   throw new ConflictException({
    //     key: 'EmailAlreadyExists',
    //     message: `A user with emailId ${dto.emailId} already exists.`,
    //   });
    // }

    // if (userByUsername && userByUsername.id !== id) {
    //   throw new ConflictException({
    //     key: 'UsernameAlreadyExists',
    //     message: `A user with username ${dto.username} already exists.`,
    //   });
    // }
    // if (userByContactNo && userByContactNo.id !== id) {
    //   throw new ConflictException({
    //     key: 'ContactNoAlreadyExists',
    //     message: `A user with contact number ${dto.contactNo} already exists.`,
    //   });
    // }
    const updatedUser = {
      id: id,
      name: dto.name,
      username: dto.username,
      password: dto.password,
      emailId: dto.emailId,
      contactNo: dto.contactNo,
      profilePicture: dto.profilePictureUrl,
      gender: existingUserById[0].gender,
    };
    const updatedUserEntity = await this.userRepository.save(updatedUser);
    return updatedUserEntity;
  }

  async deleteUserById(
    id: number,
    currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    let [user] = await this.validatePresence(id);
    if (user.id === currentUser.id || user.role === 'TOAA') {
      this.userRepository.delete(id);
    }
    return user;
  }

  async validatePresence(id: number): Promise<IUserEntity[]> {
    let user = await this.userRepository.findBy({ id });
    if (user.length === 0) {
      throw new BadRequestException({
        key: 'id',
        message: `User with id:${id} not found. Message from validate presence`,
      });
    }
    return user;
  }
}
