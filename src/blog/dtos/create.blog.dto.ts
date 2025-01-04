import { IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IBlogCreateDto } from "blog-common-1.0";
// import { IBlogCreateDto } from "../interfaces/blog.interfaces";

export class CreateBlogDto implements IBlogCreateDto {
  @IsString()
  @ApiProperty({
    description: 'title of blog',
    example: 'How to install Node.js',
    required: true,
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: 'keywords from your blog',
    example: 'nodejs, javascript',
    required: false,
  })
  keywords: string;

  @IsString()
  @ApiProperty({
    description: 'Content of blog',
    example: 'In this blog we will learn how to install node js...',
    required: true,
  })
  content: string;
    
    @IsString()
    @ApiProperty({
        description: 'Author of blog',
        example: 'John Doe',
        required:true,
    })
    author: string;

  // @IsString()
  // @ApiProperty({
  //   description: 'Date of blog creation',
  //   example: '2022-01-01',
  //   required: true,
  // })
  // createdAt: string;
}
