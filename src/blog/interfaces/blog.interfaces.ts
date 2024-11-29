import { CreateBlogDto } from "../dtos/create.blog.dto";

export interface IBlogEntity {
    id:number;
    title:string;
    author: string;
    keywords: string;
    content:string;
    createdAt:string
}

export type IBlogEntityArray = IBlogEntity[]

export interface IBlogCreateDto {
    title:string;
    author: string;
    keywords: string;
    content: string;
    createdAt:string
}

export type IBulkBlogCreateDto = [CreateBlogDto]