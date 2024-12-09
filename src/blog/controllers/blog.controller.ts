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
  IBulkBlogCreateDto,
} from '../interfaces/blog.interfaces';
import { BlogService } from '../service/blog.service';

@ApiTags('blogs')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a blog' })
  @ApiOkResponse({
    description: 'A blog created and returned with type IBlogEntity',
  })
  @Post('')
  @UseGuards(AuthGuard)
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    return this.blogService.createBlog(dto, currentUser);
  }

  @ApiOperation({ summary: 'Create bulk blog' })
  @ApiOkResponse({
    description:
      'Blogs are created in bulk returned with type IBlogEntityArray',
  })
  @Post('bulk')
  async createBlogBulk(
    @Body() dto: IBulkBlogCreateDto,
    // @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogEntityArray> {
    const bulkBlogs = await this.blogService.createBulkBlog(dto);
    console.log('these are all the bulk blogs:', bulkBlogs);
    return bulkBlogs;
  }

  @ApiOperation({ summary: 'Get all blog' })
  @ApiOkResponse({
    description: 'All blogs returned with type IBlogEntityArray',
  })
  @Get('')
  async getAllBlog(): Promise<IBlogEntityArray> {
    const blogEntity = await this.blogService.getAllBlogs();
    return blogEntity;
  }

  @ApiOperation({ summary: 'Get a blog by id' })
  @ApiOkResponse({
    description: 'A blog with specific id is returned with type IBlogEntity',
  })
  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<IBlogEntity> {
    const blogEntity = await this.blogService.getBlogById(id);
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
  ): Promise<IBlogEntity> {
    const updatedBlogEntity: IBlogEntity =
      await this.blogService.updateBlogById(id, dto);
    return updatedBlogEntity;
  }

  @ApiOperation({ summary: 'Delete a blog by id' })
  @ApiOkResponse({
    description: 'Delete a blog with specific id & return IBlogEntity',
  })
  @Delete(':id')
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<string> {
    await this.blogService.deleteBlogById(id);
    return 'Blog Deleted';
  }
}
