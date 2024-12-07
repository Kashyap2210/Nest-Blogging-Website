import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserEntityRepository extends Repository<UserEntity> {}
