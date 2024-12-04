import { IUserEntity } from 'src/users/entity.interface';

export interface CustomRequest extends Request {
  user?: IUserEntity;
}
