import { IsEnum, IsNumber } from '@nestjs/class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IUserFollowerCreateDto,
  UserFolloweeStatusEnum,
} from 'blog-common-1.0';
import { IsPositive } from 'class-validator';

@Injectable()
export class FollowersCreateDto implements IUserFollowerCreateDto {
  @ApiProperty({
    name: 'User Id',
    type: Number,
    required: true,
    example: 2,
  })
  @IsPositive()
  userId: number;

  @ApiProperty({
    name: 'followers user id',
    type: Number,
    required: true,
    example: 2,
  })
  @IsPositive()
  followeeUserId: number;

  @ApiProperty({
    name: 'status',
    required: false,
    enum: UserFolloweeStatusEnum,
    example: UserFolloweeStatusEnum.BLOCKED,
  })
  @IsEnum(UserFolloweeStatusEnum)
  status: UserFolloweeStatusEnum;

  validate() {
    if (
      this.status &&
      !Object.values(UserFolloweeStatusEnum).includes(this.status)
    )
      throw new BadRequestException({
        key: 'status',
        message: `Enum value must be one of the following ${Object.values(UserFolloweeStatusEnum)}`,
      });
  }
}
