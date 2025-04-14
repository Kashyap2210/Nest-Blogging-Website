import { IsArray, IsOptional, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IBlogSearchDto } from 'blog-common-1.0';
import { IsPositive } from 'class-validator';

export class BlogSearchDto implements IBlogSearchDto {
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  @ApiProperty({
    name: 'createdBy',
    description: 'Id of the user whose blog you want to find',
    type: Array<Number>,
    example: [4],
  })
  createdBy?: number[];

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
    type: Array<String>,
    example: 'Formula 1',
    required: false,
  })
  title?: string[];
}
