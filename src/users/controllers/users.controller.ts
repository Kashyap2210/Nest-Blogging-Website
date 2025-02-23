import {
  BadRequestException,
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { IUserCreateDto, IUserEntity, IUserEntityArray } from 'blog-common-1.0';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/decorators/current_user.decorator';
import { imageFileFilter, profilePictureEditor } from 'src/file.utils';
import { UserUpdateDto } from '../dtos/user.update.dto';
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
    // @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    // console.log('Request body:', request.body); // Check request body
    console.log('Uploaded file:', file); // Check uploaded file object

    if (!file) {
      throw new BadRequestException('File upload is required.');
    }
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
    const createdUser: IUserEntity = await this.usersService.createUser(dto);
    return createdUser;
  }

  @ApiOperation({ summary: 'Edit User Details' })
  @ApiOkResponse({
    description: 'User with id will be edited',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
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
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    // console.log('this is the dto from controller', dto);
    return await this.usersService.updateUserById(id, dto, currentUser);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'A list of users returned with type IUserEntityArray',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get()
  async getAllUsers(
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserEntityArray> {
    return this.usersService.getAllUsers(currentUser);
  }

  @ApiOperation({ summary: 'Get a user' })
  @ApiOkResponse({
    description:
      'User returned with specific id & type IUserEntity. Use this API to decorate the profile page.',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<IUserEntity> {
    return this.usersService.getUserById(id, currentUser);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({ description: 'Delete a user with id' })
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: IUserEntity,
  ): Promise<boolean> {
    try {
      return await this.usersService.deleteUserById(id, currentUser);
    } catch (error) {
      throw error;
    }
  }
}
