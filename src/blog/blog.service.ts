import { Injectable } from '@nestjs/common';
import { BlogEntity, IBlogEntity } from './blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dtos/create.blog.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BlogService {
constructor(@InjectRepository(BlogEntity) private blogRepository:Repository<BlogEntity>){}

       async createBlog(dto: CreateBlogDto): Promise<IBlogEntity> { 
           const blog = await this.blogRepository.create(dto)
           blog.createdBy = blog.updatedBy=2;
            console.log("this is the blog from the service: ", blog)
            return this.blogRepository.save(blog)
    }


}

// import { Injectable, NotFoundException } from "@nestjs/common";
// import { CreateBlogDto } from "../dtos/blog.create.dto";
// import { Repository } from "typeorm";
// import { InjectRepository } from "@nestjs/typeorm";
// import { BlogEntity } from "../entities/blog.entity";
// import { IBlogEntity } from "../interfaces/blog.entity.interface";
// import { BlogUpdeteDto } from "../dtos/update.blog.dto";


// @Injectable()
// export class BlogsService{

// constructor(@InjectRepository(BlogEntity) private repo:Repository<BlogEntity>){}

//     async createBlog(dto: CreateBlogDto): Promise<IBlogEntity> { 
//         const blog = await this.repo.create(dto)
//         console.log("this is the blog from the service: ", blog)
//         return this.repo.save(blog)
//     }

//     async getAllBlogs(): Promise<IBlogEntity[]>{
//         const allBlogs = await this.repo.find()
//         console.log("this are all the blogs from the service: ", allBlogs)
//         return allBlogs
//     }

//     async getById(id:number): Promise<any>{
//         return await this.repo.findBy({id})
//     }

//     async updateBlog(id:number,dto: BlogUpdeteDto): Promise<any>{
//         // console.log(id);
//         const blogToUpdate = await this.repo.findBy({ id })
//         let updatedBlog = {  };
//         if (!blogToUpdate) throw new NotFoundException()
//         for (const [key, value] of Object.entries(dto)) {
//             if (value) {
//                 updatedBlog[key] = value;
//             }
//         }
//         // console.log(updatedBlog);
//         await this.repo.update(id, updatedBlog);
//         return this.repo.findOne({where: {id}})
//     }
    
//     async deleteBlog(id: number): Promise<void>{
//          await this.repo.delete({ id })
        
//     }

// }