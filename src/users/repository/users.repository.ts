import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { UserEntity } from '../entities/user.entity';
import { IUserCreateDto, IUserEntity } from '../interfaces/entity.interface';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserGender } from '../enums/gender.enum';

export class UsersRepository extends EntityManagerBaseService<UserEntity> {
  getEntityClass(): new () => UserEntity {
    return UserEntity;
  }

  async getInstance(
    dto: IUserCreateDto,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const blog = {
      name: dto.name,
      username: dto.name,
      passowrd: hashedPassword,
      emailId: dto.emailId,
      contactNo: dto.contactNo,
      profilePictureUrl: dto.profilePictureUrl,
      gender: dto.gender ? dto.gender : UserGender.PREFER_NOT_TO_SAY,
      role: dto.role ? dto.role : null,
    };
    return this.getRepository(entityManager).save(blog);
  }

  async create(
    user: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    return this.getRepository(entityManager).save(user);
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
