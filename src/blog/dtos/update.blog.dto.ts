import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IBlogUpdateDto } from "../interfaces/blog.interfaces";

export class UpdateBlogDto implements IBlogUpdateDto {
    
    @IsString()
    @ApiProperty({
        description: 'Updated title of blog',
        example: 'How to install Node.js',
        required:true
    })
    title: string;
    
    @IsString()
    @ApiProperty({
        description: 'Upadted content of blog',
        example: 'In this blog we will learn how to install node js...',
        required:true
    })
    content: string;
    
    @IsString()
    @ApiProperty({
        description: 'Upadted content of blog',
        example: 'In this blog we will learn how to install node js...',
        required:true
    })
    keywords: string;
}