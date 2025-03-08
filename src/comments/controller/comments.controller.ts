import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ICommentEntity, IUserEntity } from 'blog-common-1.0';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentsService } from '../service/comments.service';
import { IEntityFilterData } from 'blog-common-1.0/dist/generi.types';
import { SearchCommentDto } from '../dto/search-comments.dto';

@ApiTags('comments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Create a comment on blog or another comment' })
  @ApiOkResponse({
    description: 'Create a comment on the blog or another comment',
  })
  @Post('')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<ICommentEntity> {
    return this.commentsService.create(createCommentDto, currentUser);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiOkResponse({
    description: 'A comment will be updated for the given id',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: IUserEntity,
  ) {
    return this.commentsService.updateCommentById(
      +id,
      updateCommentDto,
      currentUser,
    );
  }

  @ApiOperation({ summary: 'Get comments based on filter' })
  @ApiOkResponse({
    description: 'Get all searched comments',
  })
  @ApiBody({
    type: SearchCommentDto,
    description: 'Search comments using ISearchCommentDto',
  })
  @Post('search')
  async searchByFilter(
    @Body() filter: IEntityFilterData<ICommentEntity>,
  ): Promise<ICommentEntity[]> {
    return this.commentsService.getCommentsByFilter(filter);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiOkResponse({
    description: 'A comment will be deleted for the given id',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ) {
    return this.commentsService.removeComment(id, currentUser);
  }
}
