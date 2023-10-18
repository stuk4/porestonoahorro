import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Status } from '../../common/interfaces/common.interfaces';
import { Product } from '../../products/entities';
import { slugify } from '../../common/utils/slugify';
import { normalizeTagName } from '../utils/normalize';

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
        nullable: true,
        comment: 'Description of the tag',
    })
    description?: string;

    @Column('enum', {
        enum: Status,
        default: Status.DRAFT,
    })
    status: Status;

    @Column('text')
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        name: 'updated_at',
    })
    updatedAt: Date;

    @ManyToMany(() => Product, (product) => product.tags, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
    })
    products?: Product[];

    @BeforeInsert()
    updateSlugAndName() {
        this.name = normalizeTagName(this.name);
        this.slug = slugify(this.name);
    }

    @BeforeUpdate()
    updateSlugAndNameOnUpdate() {
        this.name = normalizeTagName(this.name);
        this.slug = slugify(this.name);
    }
}
