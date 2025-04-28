import { IsEnum, IsOptional } from '@nestjs/class-validator';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IUserFollowerCreateDto,
  UserFolloweeStatusEnum,
} from 'blog-common-1.0';
import { IsPositive } from 'class-validator';

@Injectable()
export class FollowersCreateDto implements IUserFollowerCreateDto {
  @IsPositive()
  @ApiProperty({
    name: 'userId',
    type: Number,
    required: true,
    example: 2,
  })
  userId: number;

  @IsPositive()
  @ApiProperty({
    name: 'followeeUserId',
    type: Number,
    required: true,
    example: 2,
  })
  followeeUserId: number;

  @IsOptional()
  @IsEnum(UserFolloweeStatusEnum)
  @ApiProperty({
    name: 'status',
    required: false,
    enum: UserFolloweeStatusEnum,
    example: UserFolloweeStatusEnum.BLOCKED,
  })
  status?: UserFolloweeStatusEnum;

  validate() {
    let errors = [];
    if (
      this.status &&
      !Object.values(UserFolloweeStatusEnum).includes(this.status)
    )
      errors.push({
        key: 'status',
        message: `Enum value must be one of the following ${Object.values(UserFolloweeStatusEnum)}`,
      });

    if (this.userId === this.followeeUserId) {
      errors.push({
        key: 'userId, followerId',
        message: 'UserId cannot be same as follower id',
      });
    }
    return errors;
  }
}
