import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  IBlogEntity,
  IBlogResponse,
  IUserEntity
} from 'blog-common-1.0';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { CreateBlogDto } from '../dtos/create.blog.dto';
import { UpdateBlogDto } from '../dtos/update.blog.dto';
import { BlogService } from '../service/blog.service';

@ApiTags('blog')
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

  @ApiOperation({ summary: 'Get all blog' })
  @ApiOkResponse({
    description: 'All blogs returned with type IBlogResponse[]',
  })
  @Get('')
  async getAllBlog(
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogResponse[]> {
    return await this.blogService.getAllBlogs(currentUser);
  }

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
  ): Promise<boolean> {
    return this.blogService.deleteBlogById(id, currentUser);
  }

  /*
  //Patch req based on a key in place of id
  @ApiOperation({ summary: 'Edit a blog by title' })
  @ApiParam({
    name: "title", type: String, description: "What are you doing? Man"
  })
  @ApiOkResponse({
    description:
      'A blog with id & edited details is returned with type IBlogEntity',
  })
  @Patch(':title')
  async updateBlogByKey(
    @Param('title') title: string,
    @Body() dto: UpdateBlogWithTitleDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    // console.log("this is the title in req", title)
    return this.blogService.updateBlogByKey(title, dto, currentUser)
  }
*/
}
