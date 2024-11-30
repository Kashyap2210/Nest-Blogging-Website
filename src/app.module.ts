import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from './blog/blog.module';
import { BlogEntity } from './blog/entities/blog.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username:'root',
      password:'sweetlordV12!',
      database:'blog_developement',
      entities:[BlogEntity],
      synchronize:true
    }),
    BlogModule,
    // Add modules here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
