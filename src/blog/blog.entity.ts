import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface IBlogEntity {
    id:number;
    title:string;
    author: string;
    keywords: string;
    content:string;
    createdAt:string
}

@Entity('blogs')
export class BlogEntity implements IBlogEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 }) 
    title: string;

    @Column({ type: 'varchar', length: 500 }) 
    keywords: string;

    @Column({ type: 'varchar', length: 10000 }) 
    content: string;

    @Column()
    author: string;

    @Column()
    createdAt:string

    @Column({ type: 'int', nullable: true }) 
    createdBy: number;

    @Column({ type: 'int', nullable: true }) 
    updatedBy: number;
}
