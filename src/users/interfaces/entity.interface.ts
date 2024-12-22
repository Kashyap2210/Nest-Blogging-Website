import { IAuditColumnEntity } from 'src/helpers/audit.column.entity.interface';
import { UserGender } from '../enums/gender.enum';

export interface IUserEntity extends IAuditColumnEntity {
  id: number;
  name: string;
  username: string;
  password: string;
  emailId: string;
  contactNo: string;
  profilePictureUrl: string;
  gender: UserGender;
  role: string;
}

export type IUserEntityArray = IUserEntity[];

export interface IUserCreateDto extends Partial<IUserEntity> {}

export interface IBulkUserCreateDto {
  users: IUserCreateDto[];
}
