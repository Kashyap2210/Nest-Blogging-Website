// @types/express/index.d.ts
import { IUserEntity } from 'src/users/interfaces/entity.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUserEntity; // Extend the Request type to include a user property
    }
  }
}
