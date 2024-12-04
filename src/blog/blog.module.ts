import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './service/blog.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [UsersModule],
  providers: [BlogService, UsersService],
  controllers: [BlogController],
})
export class BlogModule {}
