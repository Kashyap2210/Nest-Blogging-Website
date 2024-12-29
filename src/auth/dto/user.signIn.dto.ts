import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignInDto {
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
