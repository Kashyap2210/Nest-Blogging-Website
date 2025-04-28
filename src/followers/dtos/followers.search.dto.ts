import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IUserFollowerSearchDto } from 'blog-common-1.0';

@Injectable()
export class FollowersSearchDto implements IUserFollowerSearchDto {
  @ApiProperty({
    name: 'userId',
    type: Array<number>,
    description: '[1, 2, 3]',
    required: false,
  })
  userId?: number[];

  @ApiProperty({
    name: 'followeeUserId',
    type: Array<number>,
    description: '[1, 2, 3]',
    required: false,
  })
  followeeUserId?: number[];
}
