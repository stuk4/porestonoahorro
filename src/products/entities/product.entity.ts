import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { ProductImage } from './product-image.entity';
import { Status } from '../../common/interfaces/common.interfaces';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    title: string;

    @Column('text', {
        nullable: false,
        unique: true,
    })
    slug: string;

    @Column('text', {
        nullable: false,
        comment: 'Description of the product',
    })
    description: string;

    @Column('numeric', {
        comment: 'Price of the product',
        nullable: true,
    })
    price?: number;

    @Column('enum', {
        enum: Status,
        default: Status.DRAFT,
    })
    status: Status;

    @Column('text', {
        nullable: false,
    })
    thumbnail_url: string;

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

    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: false,
    })
    images?: ProductImage[];

    @ManyToMany(
        () => Tag,
        (tag) => tag.products, //optional
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    )
    @JoinTable({
        name: 'product_tag',
        joinColumn: {
            name: 'product_uuid',
            referencedColumnName: 'uuid',
        },
        inverseJoinColumn: {
            name: 'tag_uuid',
            referencedColumnName: 'uuid',
        },
    })
    tags?: Tag[];

    @BeforeInsert()
    updateSlug() {
        this.slug = slugify(this.title);
    }

    @BeforeUpdate()
    updateSlugOnUpdate() {
        this.slug = slugify(this.title);
    }
}
