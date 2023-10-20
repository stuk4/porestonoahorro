import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Product } from '../../products/entities';

@Entity()
export class WishlistItem {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Wishlist, (wishlist) => wishlist.items)
    @JoinColumn({ name: 'wishlist_uuid' })
    wishlist: Wishlist;

    @ManyToOne(() => Product, (product) => product.wishlistItems)
    @JoinColumn({ name: 'product_uuid' })
    product: Product;

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
}
