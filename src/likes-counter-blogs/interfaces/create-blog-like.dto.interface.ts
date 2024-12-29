import { LikeStatus } from '../enums/like.status.enum';

export interface IBlogLikeDto {
  blogId: number;
  likedStatus: LikeStatus;
}
