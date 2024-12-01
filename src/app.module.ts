import { Module } from '@nestjs/common';
import { BlogModule } from './blog/blog.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './users/users.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', //upload folder for files
      limits: {
        fieldSize: 1000 * 1000 * 10, //10MB
      },
    }),
    DatabaseModule,
    BlogModule,
    UserModule,
  ],
})
export class AppModule {}
