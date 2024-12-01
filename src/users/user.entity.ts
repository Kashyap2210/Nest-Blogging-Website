
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUserEntity } from "./entity.interface";
import { UserGender } from "./gender.enum";

@Entity('users')
export class UserEntity implements IUserEntity {

    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
    })
    id: number;

    @Column({
        type: 'varchar',
        name: 'name',
        length: '64'
    })
    name: string;

    @Column({
        type: 'varchar',
        name: 'username',
        length: '64'
    })
    username: string;

    @Column({
        type: 'varchar',
        name: 'password',
        length: '128'
    })
    password: string;

    @Column({
        type: 'varchar',
        name: 'email_id',
        length: '128'
    })
    emailId: string;

    @Column({
        type: 'varchar',
        length: '128',
        name: 'contact_no',
        nullable:true,
    })
    contactNo: string;

    @Column({
        type: 'varchar',
        name: 'profile_pic_url',
        length: '256',
        nullable:true,
    })
    profilePicture: string;

    @Column({
        type: 'enum',
        enum: UserGender,
        name: 'gender',
        default: UserGender.PREFER_NOT_TO_SAY
    })
    gender: UserGender;

    @Column({
        type: 'varchar',
        name: 'created_at',
        length: '256',
    })
    createdAt: string;

    @Column({
        type: 'varchar',
        name: 'updated_at',
        length: '256',
    })
    updatedAt: string

 }