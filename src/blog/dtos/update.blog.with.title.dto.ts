import { ApiProperty } from '@nestjs/swagger';
import { IBlogUpdateDto } from 'blog-common-1.0';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBlogWithTitleDto implements IBlogUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Upadted content of blog',
    example: 'In this blog we will learn how to install node js...',
    required: true,
  })
  content?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Upadted content of blog',
    example: 'In this blog we will learn how to install node js...',
    required: true,
  })
  keywords?: string;
}
