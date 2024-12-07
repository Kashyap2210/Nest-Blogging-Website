import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './service/blog.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity]), UsersModule],
  providers: [BlogService, UsersService],
  controllers: [BlogController],
})
export class BlogModule {}
