import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from '../blog/entities/blog.entity'; // Adjust the path accordingly
import { UserEntity } from 'src/users/user.entity';

@Global() // Makes the module available globally
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'sweetlordV12!',
      database: 'blog_developement',
        entities: [BlogEntity, UserEntity],
        synchronize: true,
          logging: true, // Add this line to enable logging

    }),
        TypeOrmModule.forFeature([BlogEntity, UserEntity]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
