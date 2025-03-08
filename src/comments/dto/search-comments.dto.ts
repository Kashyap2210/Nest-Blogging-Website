import {
  IsArray,
  IsOptional,
  IsPositive
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICommentSearchDto } from 'blog-common-1.0';

export class SearchCommentDto implements ICommentSearchDto {
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  @ApiProperty({
    name: 'blogId',
    description: 'Blog id for which comments are needed',
    example: [4],
    type: [Number],
  })
  blogId?: number[];
}
