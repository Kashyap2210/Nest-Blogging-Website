import { IAuditColumnEntity } from 'blog-common-1.0';
import { Column } from 'typeorm';

export class AuditColumnEntity implements IAuditColumnEntity {
  @Column({
    name: 'created_on',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdOn: Date;

  @Column({
    name: 'updated_on',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedOn: Date;

  @Column({
    name: 'created_by',
    type: 'int',
    nullable: false,
  })
  createdBy: number;

  @Column({
    name: 'updated_by',
    type: 'int',
    nullable: false,
  })
  updatedBy: number;
}
