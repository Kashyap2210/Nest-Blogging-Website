import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BlogEntity } from 'src/blog/entities/blog.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { BlogLikesCounterEntity } from 'src/likes-counter-blogs/entities/likes-counter-blog.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DBHOST'),
        port: parseInt(configService.get<string>('DBPORT'), 10),
        username: configService.get<string>('DBUSERNAME'),
        password: configService.get<string>('DBPASSWORD'),
        database: configService.get<string>('DBNAME'),
        entities: [BlogEntity, UserEntity, CommentEntity, BlogLikesCounterEntity],
        synchronize: true,
        // logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BlogEntity, UserEntity, CommentEntity, BlogLikesCounterEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
