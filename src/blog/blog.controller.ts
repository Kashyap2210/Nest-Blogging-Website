import { Body, Controller, Post } from '@nestjs/common';
import { BlogService } from './blog.service';
import { IBlogCreateDto } from './dtos/create.blog.dto';
import { IBlogEntity } from './blog.entity';

@Controller('blog')
export class BlogController {   
    constructor(private readonly blogService: BlogService) { }
    
    @Post('create')
    async createBlog(@Body() dto: IBlogCreateDto): Promise<IBlogEntity>{
        console.log(dto)
        const blogEntity = await this.blogService.createBlog(dto)
        return blogEntity;
    }
}
