import { Module } from '@nestjs/common';
import { BlogService } from './service/blog.service';
import { BlogController } from './controllers/blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';

@Module({
  providers: [BlogService],
  controllers: [BlogController]
})
export class BlogModule {}
