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
import { userUpdateDto } from '../dtos/user.update.dto';
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
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<IUserEntity> {
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
