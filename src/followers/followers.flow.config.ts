import {
  IFollowersStatusFlowConfig,
  UserFolloweeStatusEnum,
} from 'blog-common-1.0';
import { UserFolloweeActionEnum } from 'blog-common-1.0/dist/enums/followers..action.enum';

export const FollowersStatusFlowConfig: IFollowersStatusFlowConfig = {
  [UserFolloweeActionEnum.BLOCKED]: {
    next: () => UserFolloweeStatusEnum.BLOCKED,
  },
  [UserFolloweeActionEnum.MUTED]: {
    next: () => UserFolloweeStatusEnum.MUTED,
  },
  [UserFolloweeActionEnum.UNBLOCKED]: {
    next: () => null,
  },
  [UserFolloweeActionEnum.UNMUTE]: {
    next: () => null,
  },
};
