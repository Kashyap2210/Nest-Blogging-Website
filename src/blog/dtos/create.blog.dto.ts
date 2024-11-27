import { IsString } from "@nestjs/class-validator";
import { BlogEntity } from "../blog.entity";

export interface IBlogCreateDto {
    title:string;
    author: string;
    keywords: string;
    content: string;
    createdAt:string
}

export class CreateBlogDto implements IBlogCreateDto {

    @IsString()
    title: string;
    
    @IsString()
    keywords:string;

@   IsString()
    content: string;
    
    @IsString()
    author: string;

    @IsString()
    createdAt: string;

}