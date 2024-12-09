import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from '../blog/entities/blog.entity'; // Adjust the path accordingly
import { UserEntity } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Global() // Makes the module available globally
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
        entities: [BlogEntity, UserEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
      // logging: true, // Add this line to enable logging
    }),
    TypeOrmModule.forFeature([BlogEntity, UserEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
