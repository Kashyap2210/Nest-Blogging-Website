import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IUserFollowerUpdateDto,
  UserFolloweeStatusEnum,
} from 'blog-common-1.0';
import { UserFolloweeActionEnum } from 'blog-common-1.0/dist/enums/followers..action.enum';
import { IsEnum } from 'class-validator';

@Injectable()
export class FollowersUpdateDto implements IUserFollowerUpdateDto {
  @ApiProperty({
    name: 'action',
    required: false,
    enum: UserFolloweeActionEnum,
    example: UserFolloweeActionEnum.BLOCKED,
  })
  @IsEnum(UserFolloweeActionEnum)
  action: UserFolloweeActionEnum;

  status?: UserFolloweeStatusEnum;

  validate() {
    const errors = [];
    if (
      this.action &&
      !Object.values(UserFolloweeActionEnum).includes(this.action)
    )
      errors.push({
        key: 'status',
        message: `Enum value must be one of the following ${Object.values(UserFolloweeActionEnum)}`,
      });
    return errors;
  }
}
