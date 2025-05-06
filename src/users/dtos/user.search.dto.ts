import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUserEntityFilterData } from 'blog-common-1.0';
import { IsArray, IsOptional, IsPositive } from 'class-validator';

export class UserSearchDto implements IUserEntityFilterData {
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  @ApiProperty({
    name: 'id',
    description: 'Id of the blog you want to find',
    type: Array<Number>,
    example: [4],
  })
  id?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    name: 'name',
    description: 'Name of the user',
    type: Array<String>,
    example: ['Jhon'],
  })
  name?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    name: 'username',
    description: 'username of the user',
    type: Array<String>,
    example: ['tony1960s'],
  })
  username?: string[];
}
