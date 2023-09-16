import { Status } from 'src/common/interfaces/common.interfaces';
import { Product } from 'src/products/entities';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: false,
        unique: true,
    })
    slug: string;

    @Column('text', {
        nullable: false,
        comment: 'Description of the tag',
    })
    description: string;

    @Column('enum', {
        enum: Status,
        default: Status.DRAFT,
    })
    status: Status;

    @Column('text')
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updated_at: Date;

    @ManyToMany(() => Product, (product) => product.tags, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
    })
    products?: Product[];
}
