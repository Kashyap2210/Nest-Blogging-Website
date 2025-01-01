import { AuditColumnEntity } from 'src/helpers/audti.column.entity';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IBlogEntity } from "../interfaces/blog.interfaces";

@Entity('blogs')
export class BlogEntity extends AuditColumnEntity implements IBlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  keywords: string;

  @Column({ type: 'varchar', length: 10000 })
  content: string;

  @Column({ type: 'varchar', length: 256 })
  author: string;
}
