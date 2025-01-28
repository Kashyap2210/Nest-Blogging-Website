import { IsBoolean, IsPositive } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICommentCreateDto } from 'blog-common-1.0';
import { IsOptional, IsString } from "class-validator";

export class CreateCommentDto implements ICommentCreateDto {
  @IsString()
  @ApiProperty({
    name: 'text',
    description: 'text in the comment',
    example: 'This is one of the best blogs that I have read',
    required: true,
  })
  text: string;

  @IsPositive()
  @ApiProperty({
    name: 'blogId',
    description: 'id of the blog',
    example: 1,
    required: true,
  })
  blogId: number;

  @IsPositive()
  @IsOptional()
  @ApiProperty({
    name: 'replyCommentId',
    description: 'id of the blog',
    example: 1,
    required: false,
  })
  replyCommentId?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    name: 'isReplyComment',
    description: 'is this a repeated comment',
    example: true,
    required: false,
  })
  isReplyComment?: boolean;
} 