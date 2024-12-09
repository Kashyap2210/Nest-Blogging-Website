import { IAuditColumnEntity } from 'src/helpers/audit.column.entity.interface';

export interface ICommentEntity extends IAuditColumnEntity {
  id: number;
  text: string;
  author: string;
  blogId: number;
}
