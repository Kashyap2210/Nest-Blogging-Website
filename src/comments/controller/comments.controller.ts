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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IUserEntity } from 'blog-common-1.0';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentsService } from '../service/comments.service';

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
  ) {
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
