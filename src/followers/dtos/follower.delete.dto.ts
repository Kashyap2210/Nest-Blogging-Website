import { IsArray } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IDeleteFollowerDto } from 'blog-common-1.0';
import { IsPositive } from 'class-validator';

export class FollowersDeleteDto implements IDeleteFollowerDto {
  @IsArray()
  @IsPositive({ each: true })
  @ApiProperty({
    name: 'userId',
    type: Array<Number>,
    required: true,
    example: [2],
  })
  userId: number[];

  @IsArray()
  @IsPositive({ each: true })
  @ApiProperty({
    name: 'followeeUserId',
    type: Array<Number>,
    required: true,
    example: [2],
  })
  followeeUserId: number[];
}
