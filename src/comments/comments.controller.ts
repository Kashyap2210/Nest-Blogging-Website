import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { IUserEntity } from 'src/users/interfaces/entity.interface';

@ApiTags('comments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Create a comment on blog' })
  @ApiOkResponse({
    description: 'Create a comment on the blog',
  })
  @Post('')
  async createBlog(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: IUserEntity,
  ) {
    return this.commentsService.create(createCommentDto, currentUser);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
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
    console.log('this is the user from controller', currentUser);
    return this.commentsService.removeComment(id, currentUser);
  }
}
