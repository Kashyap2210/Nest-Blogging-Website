import { IsOptional, IsString } from "class-validator";
import { ICommentCreateDto } from "../interfaces/comment.create.interface";
import { IsBoolean, IsPositive } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    name: 'replyCommentId',
    description: 'id of the blog',
    example: 1,
    required: true,
  })
  replyCommentId: number;

  @IsBoolean()
  @ApiProperty({
    name: 'isReplyComment',
    description: 'is this a repeated comment',
    example: true,
    required: true,
  })
  isReplyComment: boolean;
} 