import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { slugify } from '../utils/slugify';
import { ProductImage } from './product-image.entity';
export enum ProductStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

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
        enum: ProductStatus,
        default: ProductStatus.DRAFT,
    })
    status: ProductStatus;

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
        eager: true,
    })
    images?: ProductImage[];

    @BeforeInsert()
    updateSlug() {
        this.slug = slugify(this.title);
    }

    @BeforeUpdate()
    updateSlugOnUpdate() {
        this.slug = slugify(this.title);
    }
}
