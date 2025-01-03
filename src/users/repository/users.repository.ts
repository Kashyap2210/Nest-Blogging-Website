import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { UserEntity } from '../entities/user.entity';
// import { IUserCreateDto, IUserEntity } from '../interfaces/entity.interface';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IUserCreateDto, IUserEntity, UserGender } from 'blog-common-1.0';
// import { UserGender } from '../enums/gender.enum';

export class UsersRepository extends EntityManagerBaseService<UserEntity> {
  getEntityClass(): new () => UserEntity {
    return UserEntity;
  }

  async getInstance(
    dto: IUserCreateDto,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = {
      name: dto.name,
      username: dto.username,
      password: hashedPassword,
      emailId: dto.emailId,
      contactNo: dto.contactNo,
      profilePictureUrl: dto.profilePictureUrl,
      gender: dto.gender ? dto.gender : UserGender.PREFER_NOT_TO_SAY,
      role: dto.role ? dto.role : null,
      createdBy: 1,
      updatedBy: 1,
    };
    console.log('this is the user from repository', user);
    return this.getRepository(entityManager).save(user);
  }

  async create(
    user: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserEntity> {
    return this.getRepository(entityManager).save(user);
  }

  async updateById(
    id: number,
    updateEntity: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IUserEntity[]> {
    await this.getRepository(entityManager).update(id, updateEntity);
    return this.getByFilter({ id: [id] }, entityManager);
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }
}
