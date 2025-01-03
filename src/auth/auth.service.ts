import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/services/users.service';
import { UserSignInDto } from './dto/user.signIn.dto';
import { IUserEntity, IUserLoginResponse } from 'blog-common-1.0';

export interface IJwtPayload {
  username: string;
  userId: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async logIn(signInDto: UserSignInDto) {
    const { username, password } = signInDto;
    const user: IUserEntity =
      await this.usersService.findUserByUserName(username);
    // console.log('this is the user from auth service', user);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload: IJwtPayload = {
        username: user.username,
        userId: user.id,
      };

      delete user['password'];
      const thisAccessToken = this.jwtService.sign(payload);
      // console.log('this is the access token', thisAccessToken);
      const response: IUserLoginResponse = {
        accessToken: thisAccessToken,
        user: user,
      };
      return response;
    }
  }
}
