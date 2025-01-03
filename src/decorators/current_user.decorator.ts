import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserEntity } from 'blog-common-1.0';
// import { IUserEntity } from 'src/users/interfaces/entity.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUserEntity => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user, 1);
    return request.user;
  },
);
