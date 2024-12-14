import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LikesCounterBlogsService } from './likes-counter-blogs.service';
import { CreateLikesCounterBlogDto } from './dto/create-blog-likes.dto';
import { UpdateLikesCounterBlogDto } from './dto/update-likes-counter-blog.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { IUserEntity } from 'src/users/interfaces/entity.interface';

@ApiTags('likes-counter-blogs')
@Controller('likes-counter-blogs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class LikesCounterBlogsController {
  constructor(
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
  ) {}

  @Post()
  async create(
    @Body() createLikesCounterBlogDto: CreateLikesCounterBlogDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<any> {
    return this.likesCounterBlogsService.createLikeDislikeEntity(
      createLikesCounterBlogDto,
      currentUser,
    );
  }

  @Get()
  findAll() {
    return this.likesCounterBlogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likesCounterBlogsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLikesCounterBlogDto: UpdateLikesCounterBlogDto,
  ) {
    return this.likesCounterBlogsService.update(+id, updateLikesCounterBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesCounterBlogsService.remove(+id);
  }
}
