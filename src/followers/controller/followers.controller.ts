import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/decorators/current_user.decorator';
import { IUserEntity, IUserFolloweeEntity } from 'blog-common-1.0';
import { FollowersCreateDto } from '../dtos/followers.create.dto';
import { FollowersSearchDto } from '../dtos/followers.search.dto';
import { FollowersUpdateDto } from '../dtos/followers.update.dto';
import { FollowersEntity } from '../entities/followers.entity';
import { FollowersService } from '../service/followers.service';

@Controller('followers')
@ApiTags('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @ApiBody({ type: FollowersCreateDto })
  @ApiOperation({ summary: 'Create a follower entity' })
  @ApiOkResponse({ type: FollowersEntity })
  @Post()
  async createFollowerEntity(
    @Body() dto: FollowersCreateDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserFolloweeEntity> {
    return this.followersService.create(dto, currentUser);
  }

  @ApiBody({ type: FollowersUpdateDto })
  @ApiOperation({ summary: 'Update a follower entity' })
  @ApiOkResponse({ type: FollowersEntity })
  @Patch()
  async updateFollowerEntity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FollowersUpdateDto,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserFolloweeEntity> {
    return this.followersService.updateById(id, dto, currentUser);
  }

  @ApiBody({ type: FollowersSearchDto })
  @ApiOperation({ summary: 'Search a follower entity' })
  @ApiOkResponse({ type: FollowersEntity })
  @Post('search')
  async searchFollowers(
    @Body() searchDto: FollowersSearchDto,
  ): Promise<IUserFolloweeEntity[]> {
    return this.followersService.getFollowersByFilter(searchDto);
  }

  @ApiOperation({ summary: 'Delete a follower entity' })
  @ApiOkResponse({
    description: 'Delete a follower with id & return a boolean',
  })
  @Delete(':id')
  async deleteFollowerEntity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<boolean> {
    return this.followersService.deleteById(id, currentUser);
  }
}
