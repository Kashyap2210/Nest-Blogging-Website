import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', //upload folder for files
      limits: {
        fieldSize: 1000 * 1000 * 10, //10MB
      },
    }),
    DatabaseModule,
    // TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    BlogModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
