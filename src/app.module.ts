import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module'; 
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    DatabaseModule, 
    BlogModule,
  ],
})
export class AppModule {}
