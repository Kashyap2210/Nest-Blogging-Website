import { IsArray, IsOptional, IsString, ValidateNested } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Type } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { IBulkUserCreateDto, IUserCreateDto } from './entity.interface';
import { UserGender } from './gender.enum';

export class UserCreateDto implements IUserCreateDto {
  @IsString()
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Password for the user account',
    example: 'P@ssw0rd123',
    required: true,
  })
  password: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  emailId: string;

  @IsString()
  @ApiProperty({
    description: 'Contact number of the user',
    example: '1234567890',
    required: true,
  })
  contactNo: string;

  @IsString()
  @IsOptional()
  profilePictureUrl: string;

  @IsOptional()
  @ApiProperty({
    description: 'profile.jpg',
    type: 'string',
    format: 'binary',
    required: false,
  })
  profilePictureFile: Express.Multer.File;

  @IsString()
  @ApiProperty({
    description: 'Gender of the user',
    example: UserGender.MALE, // or 'MALE', 'FEMALE', 'OTHER'
    required: true,
    enum: UserGender,
  })
  gender: UserGender;
}

export class BulkUserCreateDto implements IBulkUserCreateDto {
  @IsArray()
  @ValidateNested({each:true})
  @Type(() => UserCreateDto)
  @ApiProperty({
    description: 'Array of users to be created',
    type: [UserCreateDto],
    required:true,
  })
  users: UserCreateDto[];
}