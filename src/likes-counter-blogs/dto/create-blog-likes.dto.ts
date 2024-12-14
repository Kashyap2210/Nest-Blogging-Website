import { IsEnum, IsPositive } from '@nestjs/class-validator';
import { IBlogLikeDto } from '../interfaces/create-blog-like.dto.interface';
import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../enums/like.status.enum';

export class CreateLikesCounterBlogDto implements IBlogLikeDto {
  @IsPositive()
  @ApiProperty({
    description: 'id of blog',
    type: 'number',
    example: 1,
    required: true,
  })
  blogId: number;

  @IsEnum(LikeStatus, {
    message: 'status must be either "liked" or "disliked"',
  })
  @ApiProperty({
    description: 'status of like',
    required: true,
    example:'liked'
  })
  likedStatus: LikeStatus;
}
