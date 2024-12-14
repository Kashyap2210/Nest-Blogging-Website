import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IBlogLikesCounter } from '../interfaces/blog-like-counter.interface';
import { AuditColumnEntity } from 'src/helpers/audti.column.entity';
import { LikeStatus } from '../enums/like.status.enum';

@Entity('blogs_likes_counter')
export class BlogLikesCounterEntity
  extends AuditColumnEntity
  implements IBlogLikesCounter
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
  likedBy: number; //id of the user that liked it

  @Column({
    type: 'int',
    name: 'disLiked_by_user',
    nullable: true,
  })
  disLikedBy: number; //id of the user that disliked it
}
