import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignInDto {
  @IsString()
  @ApiProperty({
    description: 'Username',
    example: 'johnDoe',
    required: true,
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Enter your password',
    required: true,
  })
  password: string;
}
