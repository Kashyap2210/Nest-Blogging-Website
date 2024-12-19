import {
  Body,
  Controller, Param,
  ParseIntPipe, Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { CreateLikesCounterBlogDto } from '../dto/create-blog-likes.dto';
import { IBlogLikesCounterEntity } from '../interfaces/blog-like-counter.interface';
import { LikesCounterBlogsService } from '../services/likes-counter-blogs.service';

@ApiTags('likes-counter-blogs')
@Controller('likes-counter-blogs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class LikesCounterBlogsController {
  constructor(
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
  ) {}

  @Post()
  @ApiBody({
    description:
      'When a user clicks on like or dislike button this api will be called & like or dislike entity will be generated',
    type: CreateLikesCounterBlogDto,
  })
  async create(
    @Body() dto: CreateLikesCounterBlogDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogLikesCounterEntity> {
    return this.likesCounterBlogsService.createLikeDislikeEntity(
      dto,
      currentUser,
    );
  }

  @Post(':id')
  @ApiResponse({
    description:
      'When a user will double-click on the like or dislike button this api will be called and the liked status for that blog will be changed to neutral',
  })
  async updateLikesToDislikesOnBlogById(
    @Param('id', ParseIntPipe) blogId: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<string> {
    const likeDislikeEntity =
      await this.likesCounterBlogsService.changeLikeStatusOfBlogById(
        blogId,
        currentUser,
      );
    if (likeDislikeEntity === null || undefined) {
      return 'Liked status of the blog is changed';
    }
  }
}
