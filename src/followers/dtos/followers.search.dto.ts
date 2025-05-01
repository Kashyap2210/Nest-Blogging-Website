import { IsArray, IsOptional, IsPositive } from '@nestjs/class-validator';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IUserFollowerSearchDto } from 'blog-common-1.0';

// when we send
// {
//   userId: [1]
// }
// We get all the users that 1 is following

// when we send
// {
// followeeUserId:[1]
// We get all the users taht are following 1
// }

@Injectable()
export class FollowersSearchDto implements IUserFollowerSearchDto {
  @ApiProperty({
    name: 'userId',
    type: Array<number>,
    description: '[1, 2, 3]',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  userId?: number[];

  @ApiProperty({
    name: 'followeeUserId',
    type: Array<number>,
    description: '[1, 2, 3]',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  followeeUserId?: number[];
}
