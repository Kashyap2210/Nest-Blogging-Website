import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { UsersService } from 'src/users/services/users.service';
import { UserSignInDto } from './dto/user.signIn.dto';
import * as bcrypt from 'bcrypt';

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
    const user = await this.usersService.findUserByUserName(username);
    console.log('this is the user', user);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload: IJwtPayload = {
        username: user.username,
        userId: user.id,
      };

      // delete user['password'];
      const thisAccessToken = this.jwtService.sign(payload);
      console.log('this is the access token', thisAccessToken);
      return {
        accessToken: thisAccessToken,
        user,
      };
    }
  }
}
