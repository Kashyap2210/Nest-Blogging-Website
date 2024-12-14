import { PartialType } from '@nestjs/swagger';
import { CreateLikesCounterBlogDto } from './create-blog-likes.dto';

export class UpdateLikesCounterBlogDto extends PartialType(
  CreateLikesCounterBlogDto,
) {}
