import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IUserFollowerUpdateDto,
  UserFolloweeStatusEnum,
} from 'blog-common-1.0';
import { IsEnum } from 'class-validator';

@Injectable()
export class FollowersUpdateDto implements IUserFollowerUpdateDto {
  @ApiProperty({
    name: 'status',
    required: false,
    enum: UserFolloweeStatusEnum,
    example: UserFolloweeStatusEnum.BLOCKED,
  })
  @IsEnum(UserFolloweeStatusEnum)
  status: UserFolloweeStatusEnum;

  validate() {
    const errors = [];
    if (
      this.status &&
      !Object.values(UserFolloweeStatusEnum).includes(this.status)
    )
      errors.push({
        key: 'status',
        message: `Enum value must be one of the following ${Object.values(UserFolloweeStatusEnum)}`,
      });
    return errors;
  }
}
