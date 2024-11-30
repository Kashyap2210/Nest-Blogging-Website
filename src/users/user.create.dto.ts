import { IsOptional, IsString } from "@nestjs/class-validator";
import { IUserCreateDto } from "./entity.interface";
import { UserGender } from "./gender.enum";
import { IsEmail, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "@nestjs/class-transformer";

export class UserCreateDto implements IUserCreateDto {
  
  @IsString()
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: true
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe123',
    required: true
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Password for the user account',
    example: 'P@ssw0rd123',
    required: true
  })
  password: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: true
  })
  emailId: string;

  @IsNumber()
  @ApiProperty({
    description: 'Contact number of the user',
    example: '1234567890',
    required: true
  })
  contactNo: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'URL of the user’s profile picture',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  profilePicture: string;

  @IsString()
  @ApiProperty({
    description: 'Gender of the user',
    example: UserGender.MALE, // or 'MALE', 'FEMALE', 'OTHER'
    required: true,
    enum: UserGender
  })
  gender: UserGender;
}
