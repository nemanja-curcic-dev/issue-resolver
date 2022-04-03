import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    name: 'issues',
})
export class Issue {
    @PrimaryGeneratedColumn({
        unsigned: true,
    })
    id?: number;

    @Column({
        length: 100,
        nullable: false,
    })
    title!: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    description!: string;

    @Column({
        length: 15,
        nullable: false,
    })
    status!: string;
}
