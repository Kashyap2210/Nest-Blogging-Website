import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { IUserEntity, IUserEntityArray } from './entity.interface';
import { UserCreateDto } from './user.create.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    
    @ApiOperation({ summary: 'Create a user' })
    @ApiOkResponse({ description: 'A user created and returned with type IUserEntity'})
    @Post()
    async createUser(@Body() dto: UserCreateDto): Promise<IUserEntity>{
        const createdUser = await this.usersService.createUser(dto)
        console.log(createdUser)
        //exclude password from the response
        return createdUser 
    }

    // Create users in bulk

    @ApiOperation({ summary: 'Get all users' })
    @ApiOkResponse({ description: 'A list of users returned with type IUserEntityArray' })
    @Get()
    async getAllUsers(): Promise<IUserEntityArray>{
        //exclude password from the response
        return this.usersService.getAllUsers();
    }

    
    @ApiOperation({ summary: 'Get a users' })
    @ApiOkResponse({ description: 'User returned with specific id & type IUserEntityArray' })
    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id:number): Promise<IUserEntityArray>{
        //exclude password from the response
        return this.usersService.getUserById(id);
    }


    @ApiOperation({ summary: 'Delete a user' })
    @ApiOkResponse({ description: 'Delete a user with id' })
    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<IUserEntity[]>{
        return this.usersService.deleteUserById(id)
    }
}
