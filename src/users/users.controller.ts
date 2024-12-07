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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  IUserCreateDto,
  IUserEntity,
  IUserEntityArray,
} from './entity.interface';
import { BulkUserCreateDto, UserCreateDto } from './user.create.dto';
import { userUpdateDto } from './user.update.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFileFilter, profilePictureEditor } from 'src/file.utils';
import { format } from 'path';
import { extname } from 'path';

function fileEditor(req, file, callback) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileExt = extname(file.originalname);
  const newFilename = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
  callback(null, newFilename);
}

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
        filename: fileEditor,
        destination: './uploads',
      }),
      // fileFilter: imageFileFilter,
      limits: {
        fieldSize: 1000 * 1000 * 10,
      },
    }),
  )
  async createUser(
    @Req() request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IUserEntity> {
    console.log('Uploaded file:', file);
    const { name, username, password, emailId, contactNo, gender } =
      request.body; // Extract other fields manually

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
    //exclude password from the response
    return createdUser;
  }

  // A utility to generate a unique filename for each uploaded file

  @Post('profile-picture')
  @ApiOperation({ summary: 'Upload a profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a profile picture',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload an image',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Directory to store the uploaded file
        filename: fileEditor, // Custom filename generation logic
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // Set a file limit of 10MB
      },
    }),
  )
  async uploadProfilePic(@UploadedFile() file: Express.Multer.File) {
    console.log('Uploaded file:', file);
    return { message: 'File uploaded successfully', file };
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
