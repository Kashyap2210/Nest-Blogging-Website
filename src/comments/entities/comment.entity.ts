import { ICommentEntity } from 'blog-common-1.0';
import { AuditColumnEntity } from '@src/helpers/audti.column.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
    type: 'int',
    nullable: false,
    name: 'author_id',
  })
  authorId: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'blog_id',
  })
  blogId: number;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'is_reply_comment',
  })
  isReplyComment: boolean;

  @Column({
    type: 'int',
    nullable: true,
    name: 'reply_comment_id',
  })
  replyCommentId: number;
}
