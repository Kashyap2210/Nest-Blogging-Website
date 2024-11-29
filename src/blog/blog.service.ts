import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogEntity } from './blog.entity';
import { IBlogCreateDto, IBlogEntity, IBlogEntityArray, IBlogUpdateDto, IBulkBlogCreateDto } from './interfaces/blog.interfaces';

@Injectable()
export class BlogService {
constructor(@InjectRepository(BlogEntity) private blogRepository:Repository<BlogEntity>){}

    async createBlog(dto: IBlogCreateDto): Promise<IBlogEntity> { 
        const blog = this.blogRepository.create(dto)
        blog.createdBy = blog.updatedBy = 2;
        const currentDate = new Date()
        blog.createdAt = blog.updatedAt = currentDate.toString() 
        console.log("this is the blog from the service: ", blog)
        return this.blogRepository.save(blog)
    }

    async createBulkBlog(dto: IBulkBlogCreateDto): Promise<IBlogEntityArray>{
        const bulkBlogs:IBlogEntityArray = []
        for (const blog of dto) {
            const bulkBlog = await this.blogRepository.save(blog)
            bulkBlog.createdBy = bulkBlog.updatedBy = 2;
            const currentDate = new Date()
            bulkBlog.createdAt = bulkBlog.updatedAt = currentDate.toString()
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

    async updateBlogById(id: number, dto: IBlogUpdateDto): Promise<IBlogEntity>{ //change return type
        const blogEntityById = await this.getBlogById(id)
        if (!blogEntityById) { 
            throw new BadRequestException({key:'Not Found',message:'Blog with this title does not exist'})
        }
        const blogFromDtoTitle = await this.blogRepository.findBy({ title: dto.title })
        if (blogFromDtoTitle.length > 0 && blogFromDtoTitle[0].id !== id) { 
            throw new BadRequestException({key:'Already exists',message:'Blog with this title already exists'})
        }
        const currentDate = new Date()
        blogEntityById.title = dto.title,
        blogEntityById.content = dto.content,
        blogEntityById.updatedBy = blogEntityById.createdBy,
        blogEntityById.updatedAt = currentDate.toString(),
        blogEntityById.keywords = dto.keywords,
        blogEntityById.createdBy = blogEntityById.updatedBy = 2

        const updatedBlog :IBlogEntity = await this.blogRepository.save(blogEntityById)
        console.log(updatedBlog)
        return updatedBlog;
    }

    async deleteBlogById(id: number): Promise<void>{
        const blogToBeDeleted = await this.getBlogById(id)
        this.blogRepository.delete(blogToBeDeleted)
    }

}

