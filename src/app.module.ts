import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CommentsModule } from './comments/comments.module';
import { DatabaseModule } from './database/database.module';
import { FollowersModule } from './followers/followers.module';
import { LikesCounterBlogsModule } from './likes-counter-blogs/likes-counter-blogs.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
    CommentsModule,
    LikesCounterBlogsModule,
    CacheModule.register({
      isGlobal: true,
    }),
    FollowersModule,
  ],
})
export class AppModule {}
