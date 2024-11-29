import { CreateBlogDto } from "../dtos/create.blog.dto";

export interface IBlogEntity {
    id:number;
    title:string;
    author: string;
    keywords: string;
    content:string;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;
}

export type IBlogEntityArray = IBlogEntity[]

export interface IBlogCreateDto {
    title:string;
    author: string;
    keywords: string;
    content: string;
    createdAt:string
}

export type IBulkBlogCreateDto = [IBlogCreateDto]

export interface IBlogUpdateDto {
    title:string;
    content: string;
    keywords: string
}