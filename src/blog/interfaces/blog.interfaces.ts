import { ICommentEntity } from 'src/comments/interfaces/comment.entity.interface';
import { IAuditColumnEntity } from 'src/helpers/audit.column.entity.interface';

export interface IBlogEntity extends IAuditColumnEntity {
  id: number;
  title: string;
  author: string;
  keywords: string;
  content: string;
}

export type IBlogEntityArray = IBlogEntity[];

export interface IBlogCreateDto {
  title: string;
  keywords: string;
  content: string;
  createdAt: string;
  author: string;
}

export type IBulkBlogCreateDto = [IBlogCreateDto];

export interface IBlogUpdateDto {
  title: string;
  content: string;
  keywords: string;
}

export type IBlogResponse = {
  blog: IBlogEntity;
  comments: ICommentEntity[];
};
