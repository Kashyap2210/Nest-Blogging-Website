import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserCreateDto, IUserEntity, IUserEntityArray } from './entity.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private userRepository: Repository<IUserEntity>) { }
    
    async createUser(dto: IUserCreateDto)
        : Promise<IUserEntity>{
        console.log(dto)
        const userByEmailId = await this.userRepository.find({where: {emailId: dto.emailId}})
        if (!userByEmailId) {
            throw new NotFoundException({
                key: "User found with same email id",
                message:`No user found with emailId: ${dto.emailId}`
            })
        }
        const userByUsername = await this.userRepository.find({where: {username: dto.username}})
        if (!userByUsername) {
            throw new NotFoundException({
                key: "User found with same username",
                message:`No user found with username: ${dto.username}`
            })
        }
        const userByContactNo = await this.userRepository.find({where: {contactNo: dto.contactNo}})
        if (!userByContactNo) {
            throw new NotFoundException({
                key: "User found with same contact number",
                message:`No user found with contact number: ${dto.contactNo}`
            })
        }
        const user = this.userRepository.create(dto);
        user.createdAt = user.updatedAt = new Date().toString()
        console.log("this is the user from service", user)
        return this.userRepository.save(user)
    }

    async getAllUsers(): Promise<IUserEntityArray>{
        return this.userRepository.find()
    }

    async getUserById(id:number): Promise<IUserEntityArray>{
        const userById = await this.userRepository.findBy({ id })
        if (userById.length === 0) {
             throw new NotFoundException({
                key: "User not found",
                message:`No user found with id: ${id}`
            })
        }
        return userById
    }

    async deleteUserById(id : number): Promise<IUserEntity[]>{
        let user = await this.userRepository.findBy({id})
        if (!user) {
            throw new NotFoundException({
                key: "User not found",
                message:`No user found with id: ${id}`
            })
        }
        this.userRepository.delete(id)
        return user
    }
}
