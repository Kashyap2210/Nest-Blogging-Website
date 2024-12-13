import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { IsOptional, IsString } from 'class-validator';

export interface ICommentUpdateDto {
  text?: string;
}

export class UpdateCommentDto implements ICommentUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'text',
    description: 'text in the comment',
    example: 'This is one of the best blogs that I have read',
    required: true,
  })
  text: string;
}
