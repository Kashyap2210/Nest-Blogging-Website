import { UserGender } from "./gender.enum";

export interface IUserEntity{
    id: number;
    name: string;
    username: string;
    password: string;
    emailId: string;
    contactNo: number;
    profilePicture: string;
    gender: UserGender;
    createdAt: string;
    updatedAt: string;
}

export type IUserEntityArray = IUserEntity[]

export interface IUserCreateDto extends Partial<IUserEntity> { }

export type IUserBulkCreateDto = [IUserCreateDto]