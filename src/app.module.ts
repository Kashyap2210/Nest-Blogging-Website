import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module'; 
import { BlogModule } from './blog/blog.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    DatabaseModule, 
    BlogModule,
    UserModule
  ],
})
export class AppModule {}
