import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUserSignDto } from 'blog-common-1.0';

export class UserSignInDto implements IUserSignDto {
  @IsString()
  @ApiProperty({
    description: 'Username',
    example: 'kash1997',
    required: true,
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Enter your password',
    required: true,
    example: 'kash1997',
  })
  password: string;
}
