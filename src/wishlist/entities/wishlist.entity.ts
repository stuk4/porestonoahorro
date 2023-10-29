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
import { UserProfile } from '../../user-database/entities/user-profile.entity';
import { WishlistItem } from './wishlist-item';

@Entity()
export class Wishlist {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @ManyToOne(() => UserProfile, (userProfile) => userProfile.wishlists, {
        eager: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'profile_uuid' })
    userProfile: UserProfile;

    @OneToMany(() => WishlistItem, (item) => item.wishlist, {
        cascade: true,
        onDelete: 'CASCADE',
    })
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
