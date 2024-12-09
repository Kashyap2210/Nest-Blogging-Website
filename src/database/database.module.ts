import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from '../blog/entities/blog.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { CommentEntity } from 'src/comments/entities/comment.entity';

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
        entities: [BlogEntity, UserEntity, CommentEntity],
        synchronize: true,
        // logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BlogEntity, UserEntity, CommentEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
