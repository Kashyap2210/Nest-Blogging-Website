import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogEntity} from './blog.entity';
import { CreateBlogDto } from './dtos/create.blog.dto';
import { IBlogCreateDto, IBlogEntity, IBlogEntityArray, IBulkBlogCreateDto } from './interfaces/blog.interfaces';

@Injectable()
export class BlogService {
constructor(@InjectRepository(BlogEntity) private blogRepository:Repository<BlogEntity>){}

    async createBlog(dto: IBlogCreateDto): Promise<IBlogEntity> { 
        const blog = await this.blogRepository.create(dto)
        blog.createdBy = blog.updatedBy=2;
        console.log("this is the blog from the service: ", blog)
        return this.blogRepository.save(blog)
    }

    async createBulkBlog(dto: IBulkBlogCreateDto): Promise<IBlogEntityArray>{
        const bulkBlogs:IBlogEntityArray = []
        for (const blog of dto) {
            const bulkBlog = await this.blogRepository.save(blog)
            bulkBlogs.push(bulkBlog)
        }
        return bulkBlogs
    }

    async getAllBlogs(): Promise<IBlogEntityArray>{
        return this.blogRepository.find()
    }

    async getBlogById(id: number): Promise<IBlogEntity>{
        return this.blogRepository.findOneBy({id})
    }

    async deleteBlogById(id: number): Promise<void>{
        const blogToBeDeleted = await this.getBlogById(id)
        this.blogRepository.delete(blogToBeDeleted)
    }

}

