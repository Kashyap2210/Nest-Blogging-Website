import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IUserCreateDto } from './entity.interface';

export class userUpdateDto implements Partial<IUserCreateDto> {
  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  name?: string;

  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  username?: string;

  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true,
  })
  password?: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  emailId?: string;

  @IsString()
  @ApiProperty({
    description: 'Contact number of the user',
    example: '1234567890',
    required: true,
  })
  contactNo?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'URL of the user’s profile picture',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profilePicture: string;
}
