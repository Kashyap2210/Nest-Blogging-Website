import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IUserCreateDto } from '../interfaces/entity.interface';

export interface IUserUpdateDto extends Partial<IUserCreateDto>{}

export class UserUpdateDto implements IUserUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  username?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  password?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  emailId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Contact number of the user',
    example: '1234567890',
    required: true,
  })
  contactNo?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'User’s profile picture',
    type: 'string',
    format: 'binary',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profilePicture: string;
}
