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
}
