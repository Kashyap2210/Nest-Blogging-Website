import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { CreateBlogDto } from '../dtos/create.blog.dto';
import { UpdateBlogDto } from '../dtos/update.blog.dto';
import {
  IBlogEntity,
  IBlogEntityArray,
  IBlogResponse
} from '../interfaces/blog.interfaces';
import { BlogService } from '../service/blog.service';

@ApiTags('blogs')
@Controller('blog')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: 'Create a blog' })
  @ApiOkResponse({
    description: 'A blog created and returned with type IBlogEntity',
  })
  @Post('')
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    return this.blogService.createBlog(dto, currentUser);
  }

  // @ApiOperation({ summary: 'Get all blog' })
  // @ApiOkResponse({
  //   description: 'All blogs returned with type IBlogEntityArray',
  // })
  // @Get('')
  // async getAllBlog(
  //   @CurrentUser() currentUser: IUserEntity,
  // ): Promise<IBlogEntityArray> {
  //   const blogEntity = await this.blogService.getAllBlogs(currentUser);
  //   return blogEntity;
  // }

  @ApiOperation({ summary: 'Get a blog by id' })
  @ApiOkResponse({
    description: 'A blog with specific id is returned with type IBlogEntity',
  })
  @Get(':id')
  async getBlog(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogResponse> {
    const blogEntity = await this.blogService.getBlogById(id, currentUser);
    return blogEntity;
  }

  @ApiOperation({ summary: 'Edit a blog by id' })
  @ApiOkResponse({
    description:
      'A blog with id & eidted details is returned with type IBlogEntity',
  })
  @Patch(':id')
  async updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    const updatedBlogEntity: IBlogEntity =
      await this.blogService.updateBlogById(id, dto, currentUser);
    return updatedBlogEntity;
  }

  @ApiOperation({ summary: 'Delete a blog by id' })
  @ApiOkResponse({
    description: 'Delete a blog with specific id & return IBlogEntity',
  })
  @Delete(':id')
  async deleteBlog(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<string> {
    await this.blogService.deleteBlogById(id, currentUser);
    return 'Blog Deleted';
  }
}
