import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../user-database/entities/profile.entity';
import { WishlistItem } from './wishlist-item';
@Entity()
export class Wishlist {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @ManyToOne(() => Profile, (profile) => profile.wishlists)
    @JoinColumn({ name: 'profile_uuid' })
    profile: Profile;

    @OneToMany(() => WishlistItem, (item) => item.wishlist)
    items: WishlistItem[];

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
