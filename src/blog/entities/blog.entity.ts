import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IBlogEntity } from "../interfaces/blog.interfaces";

@Entity('blogs')
export class BlogEntity implements IBlogEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 }) 
    title: string;

    @Column({ type: 'varchar', length: 500, nullable:true }) 
    keywords: string;

    @Column({ type: 'varchar', length: 10000 }) 
    content: string;

    @Column()
    author: string;

    @Column()
    createdAt:string

    @Column({ type: 'int', nullable: true }) 
    createdBy: number;

    @Column({ type: 'int', nullable:true }) 
    updatedBy: number;

    @Column({ type: 'varchar', nullable: true })
    updatedAt: string
}
