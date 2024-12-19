import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { imageFileFilter, profilePictureEditor } from 'src/file.utils';
import { BulkUserCreateDto } from '../dtos/user.create.dto';
import { UserUpdateDto } from '../dtos/user.update.dto';
import {
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
} from '../interfaces/entity.interface';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({
    description: 'A user created and returned with type IUserEntity',
  })
  @Post()
  @ApiOperation({ summary: 'Create a user' })
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
        file: {
          type: 'string',
          format: 'binary',
          description: 'upload an image',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
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
  async createUser(
    @Req() request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IUserEntity> {
    const { name, username, password, emailId, contactNo, gender } =
      request.body;
    const dto: IUserCreateDto = {
      name,
      username,
      password,
      emailId,
      contactNo,
      gender,
      profilePictureUrl: file.filename,
    };
    const createdUser = await this.usersService.createUser(dto);
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
    return createdUsers;
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'A list of users returned with type IUserEntityArray',
  })
  @Patch(':id')
  @ApiBody({
    description: 'Data required to update a single user',
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
        file: {
          type: 'string',
          format: 'binary',
          description: 'upload an image',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
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
  async updateUser(
    @Body() dto: UserUpdateDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IUserEntity> {
    return await this.usersService.updateUserById(id, dto);
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

  @ApiOperation({ summary: 'Get a user' })
  @ApiOkResponse({
    description:
      'User returned with specific id & type IUserEntity. Use this API to decorate the profile page.',
  })
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<IUserEntity> {
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
