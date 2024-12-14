import { IAuditColumnEntity } from 'src/helpers/audit.column.entity.interface';
import { LikeStatus } from '../enums/like.status.enum';

export interface IBlogLikesCounter extends IAuditColumnEntity {
  id: number;
  blogId: number;
  likedStatus: LikeStatus;
  likedBy: number; //id of the user that liked it
  disLikedBy: number; //id of the user that disliked it
}
