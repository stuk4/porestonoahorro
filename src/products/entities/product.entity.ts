import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { ProductImage } from './product-image.entity';
import { Status } from '../../common/interfaces/common.interfaces';
import { Tag } from '../../tags/entities/tag.entity';
import { UserProfile } from '../../user-database/entities/user-profile.entity';
import { WishlistItem } from '../../wishlist/entities/wishlist-item';

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
        name: 'thumbnail_url',
        nullable: false,
    })
    thumbnailUrl: string;

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

    @ManyToOne(() => UserProfile, (userProfile) => userProfile.product, {
        eager: false,
    })
    @JoinColumn({ name: 'user_profile_uuid' })
    userProfile: UserProfile;

    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        onDelete: 'CASCADE',
        eager: false,
    })
    images?: ProductImage[];

    @ManyToMany(() => Tag, (tag) => tag.products, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
    })
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

    @OneToMany(() => WishlistItem, (item) => item.product, {
        cascade: true,
    })
    wishlistItems: WishlistItem[];

    @BeforeInsert()
    updateSlug() {
        this.slug = slugify(this.title);
    }

    @BeforeUpdate()
    updateSlugOnUpdate() {
        this.slug = slugify(this.title);
    }
}
