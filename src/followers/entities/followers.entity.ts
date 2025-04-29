import { AuditColumnEntity } from '@src/helpers/audti.column.entity';
import { IUserFolloweeEntity, UserFolloweeStatusEnum } from 'blog-common-1.0';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('followers')
export class FollowersEntity
  extends AuditColumnEntity
  implements IUserFolloweeEntity
{
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'followee_user_id' })
  followeeUserId: number;

  @Column({
    type: 'enum',
    enum: UserFolloweeStatusEnum,
    nullable: true,
  })
  status: UserFolloweeStatusEnum;
}
