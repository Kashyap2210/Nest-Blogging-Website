import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BulkUserCreateDto } from '../dtos/user.create.dto';
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
  async createUser(dto: IUserCreateDto): Promise<IUserEntity> {
    const userByEmailId = await this.userRepository.findOne({
      where: { emailId: dto.emailId },
    });
    if (userByEmailId) {
      throw new NotFoundException({
        key: 'User found with same email id',
        message: `No user found with emailId: ${dto.emailId}`,
      });
    }
    const userByUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (userByUsername) {
      throw new NotFoundException({
        key: 'User found with same username',
        message: `No user found with username: ${dto.username}`,
      });
    }
    const userByContactNo = await this.userRepository.findOne({
      where: { contactNo: dto.contactNo },
    });
    if (userByContactNo) {
      throw new NotFoundException({
        key: 'User found with same contact number',
        message: `No user found with contact number: ${dto.contactNo}`,
      });
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    dto['password'] = hashedPassword;
    const user = this.userRepository.create(dto);
    user.profilePictureUrl = dto.profilePictureUrl;
    user.createdBy = user.updatedBy = '1';
    delete user['password'];
    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<IUserEntityArray> {
    return this.userRepository.find();
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    return this.userRepository.findOne({ where: { username: name } });
  }

  async getUserById(userId: number): Promise<IUserEntity> {
    const [userById] = await this.validatePresence(userId);
    delete userById['password'];
    return userById;
  }

  async createUsersInBulk(dto: BulkUserCreateDto): Promise<IUserEntityArray> {
    let createdUsers: IUserEntityArray = [];
    for (const user of dto.users) {
      try {
        const createdUser = await this.createUser(user);
        createdUsers.push(createdUser);
      } catch (error) {
        throw new BadRequestException({
          key: 'Unable To CreateUser',
          message: 'Failed to create user',
        });
      }
    }
    return createdUsers;
  }

  async updateUserById(id: number, dto: IUserUpdateDto): Promise<any> {
    const existingUserById = await this.validatePresence(id);
    const [userByEmailId, userByUsername, userByContactNo] = await Promise.all([
      this.userRepository.findOne({ where: { emailId: dto.emailId } }),
      this.userRepository.findOne({ where: { username: dto.username } }),
      this.userRepository.findOne({ where: { contactNo: dto.contactNo } }),
    ]);
    if (userByEmailId && userByEmailId.id !== id) {
      throw new ConflictException({
        key: 'EmailAlreadyExists',
        message: `A user with emailId ${dto.emailId} already exists.`,
      });
    }

    if (userByUsername && userByUsername.id !== id) {
      throw new ConflictException({
        key: 'UsernameAlreadyExists',
        message: `A user with username ${dto.username} already exists.`,
      });
    }
    if (userByContactNo && userByContactNo.id !== id) {
      throw new ConflictException({
        key: 'ContactNoAlreadyExists',
        message: `A user with contact number ${dto.contactNo} already exists.`,
      });
    }
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

  async deleteUserById(id: number): Promise<IUserEntity[]> {
    let user = await this.validatePresence(id);
    this.userRepository.delete(id);
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
