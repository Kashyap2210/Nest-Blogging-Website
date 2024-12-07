import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', //upload folder for files
      limits: {
        fieldSize: 1000 * 1000 * 10, //10MB
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigModule available globally across your app
    }),
    DatabaseModule,
    BlogModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
