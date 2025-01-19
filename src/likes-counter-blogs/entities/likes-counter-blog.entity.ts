import { IBlogLikesCounterEntity, LikeStatus } from 'blog-common-1.0';
import { AuditColumnEntity } from '@src/helpers/audti.column.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blogs_likes_counter')
export class BlogLikesCounterEntity
  extends AuditColumnEntity
  implements IBlogLikesCounterEntity
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    name: 'blogId',
  })
  blogId: number;

  @Column({
    type: 'enum',
    enum: LikeStatus,
    name: 'like_status',
  })
  likedStatus: LikeStatus;

  @Column({
    type: 'int',
    name: 'liked_by_user',
    nullable: true,
  })
  likedBy: number;

  @Column({
    type: 'int',
    name: 'disLiked_by_user',
    nullable: true,
  })
  disLikedBy: number;
}
