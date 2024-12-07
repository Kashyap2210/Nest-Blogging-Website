import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user.signIn.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@Injectable()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login a user' })
  @ApiOkResponse({
    description: 'A user is logged in & he can then traverse through the app',
  })
  @Post('login')
  async loginUser(@Body() signInDto: UserSignInDto) {
    console.log(signInDto);
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}