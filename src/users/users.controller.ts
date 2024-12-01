import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { IUserEntity, IUserEntityArray } from './entity.interface';
import { BulkUserCreateDto, UserCreateDto } from './user.create.dto';
import { userUpdateDto } from './user.update.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFileFilter, profilePictureEditor } from 'src/file.utils';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiOkResponse({
    description: 'A user created and returned with type IUserEntity',
  })
  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        filename: profilePictureEditor,
        destination: './uploads',
      }),
      fileFilter: imageFileFilter,
      limits: {
        fieldSize: 1000 * 1000 * 10,
      },
    }),
  )
  @ApiConsumes('multipart/formdata')
  @ApiBody({
    description: 'Data required to create a single user',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        username: { type: 'string', example: 'johndoe123' },
        password: { type: 'string', example: 'P@ssw0rd123' },
        emailId: {
          type: 'string',
          example: 'john.doe@example.com',
          format: 'email',
        },
        contactNo: { type: 'string', example: '1234567890' },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER'],
          example: 'MALE',
        },
        profilePictureFile: { type: 'string', format: 'binary' },
      },
    },
  })
  async createUser(
    @Body() dto: UserCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IUserEntity> {
    // console.log('file', file);
    // console.log('filename : ', file.filename);
    // console.log('file size : ', file.size);
    dto.profilePictureUrl = file.filename;
    const createdUser = await this.usersService.createUser(dto);
    //exclude password from the response
    return createdUser;
  }

  @ApiOperation({ summary: 'Create users in bulk' })
  @ApiOkResponse({
    description: 'A list of bulk users created with tyep IUserEntityArray',
  })
  @Post('bulk')
  async createUsersInBulk(
    @Body() dto: BulkUserCreateDto,
  ): Promise<IUserEntityArray> {
    const createdUsers = await this.usersService.createUsersInBulk(dto);
    console.log('this are the created users from the controller', createdUsers);
    return createdUsers;
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'A list of users returned with type IUserEntityArray',
  })
  @Patch(':id')
  async updateUser(
    @Body() dto: userUpdateDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IUserEntity> {
    const updatedUser = await this.usersService.updateUserById(id, dto);
    return updatedUser;
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'A list of users returned with type IUserEntityArray',
  })
  @Get()
  async getAllUsers(): Promise<IUserEntityArray> {
    //exclude password from the response
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get a users' })
  @ApiOkResponse({
    description: 'User returned with specific id & type IUserEntityArray',
  })
  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IUserEntityArray> {
    //exclude password from the response
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({ description: 'Delete a user with id' })
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IUserEntity[]> {
    return this.usersService.deleteUserById(id);
  }
}
