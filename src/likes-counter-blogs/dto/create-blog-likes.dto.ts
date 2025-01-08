import { IsEnum, IsPositive } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IBlogLikeDto, LikeStatus } from 'blog-common-1.0';

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
    example: 'liked',
  })
  likedStatus: LikeStatus;
}
