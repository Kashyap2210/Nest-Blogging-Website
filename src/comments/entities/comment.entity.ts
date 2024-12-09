import { AuditColumnEntity } from 'src/helpers/audti.column.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ICommentEntity } from '../interfaces/comment.entity.interface';

@Entity('comments')
export class CommentEntity extends AuditColumnEntity implements ICommentEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 1028,
    nullable: false,
    name: 'text',
  })
  text: string;

  @Column({
    type: 'varchar',
    length: 1028,
    nullable: false,
    name: 'author',
  })
  author: string;

  @Column({
    type: 'int',
    nullable: false,
    name: 'blog_id',
  })
  blogId: number;
}
