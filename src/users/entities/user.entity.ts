import { IUserEntity, UserGender } from 'blog-common-1.0';
import { AuditColumnEntity } from '@src/helpers/audti.column.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends AuditColumnEntity implements IUserEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: '64',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'username',
    length: '64',
  })
  username: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: '128',
  })
  password: string;

  @Column({
    type: 'varchar',
    name: 'email_id',
    length: '128',
  })
  emailId: string;

  @Column({
    type: 'varchar',
    length: '128',
    name: 'contact_no',
    nullable: true,
  })
  contactNo: string;

  @Column({
    type: 'varchar',
    name: 'profile_pic_url',
    length: '256',
    nullable: true,
  })
  profilePictureUrl: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    name: 'gender',
    default: UserGender.PREFER_NOT_TO_SAY,
  })
  gender: UserGender;

  @Column({
    type: 'varchar',
    name: 'role',
    nullable: true,
  })
  role: string;
}
