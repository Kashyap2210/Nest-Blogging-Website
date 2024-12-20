import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
} from '../interfaces/entity.interface';
import { BulkUserCreateDto } from '../dtos/user.create.dto';
import { UserEntity } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

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
    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<IUserEntityArray> {
    return this.userRepository.find();
  }

  async findUserByUserName(name: string): Promise<IUserEntity> {
    return this.userRepository.findOne({ where: { username: name } });
  }

  async getUserById(userId: number): Promise<IUserEntity> {
    const userById = await this.userRepository.findOne({
      where: { id: userId },
    });
    return userById;
  }

  async updateUserById(id: number, dto: Partial<IUserCreateDto>): Promise<any> {
    const existingUserById = await this.getUserById(id);
    if (!existingUserById) {
      throw new NotFoundException({
        key: 'UserNotFound',
        message: `No user found with id: ${id}`,
      });
    }
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
    let user = await this.userRepository.findBy({ id });
    if (!user) {
      throw new NotFoundException({
        key: 'User not found',
        message: `No user found with id: ${id}`,
      });
    }
    this.userRepository.delete(id);
    return user;
  }
}
