import { Body, Controller, Injectable, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user.signIn.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IUserLoginResponse } from 'blog-common-1.0';

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
  async loginUser(
    @Body() signInDto: UserSignInDto,
  ): Promise<IUserLoginResponse> {
    const loggedInUser = await this.authService.logIn(signInDto);
    console.log('this is the loggedInUser', loggedInUser);
    return loggedInUser;
  }
}
