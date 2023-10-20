import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Gender } from '../interfaces/user-databse.interfaces';
import { Product } from '../../products/entities';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column('text', { nullable: true, name: 'inactive_reason' })
    inactiveReason: string;

    @Column('enum', {
        enum: Gender,
        nullable: true,
    })
    gender: Gender;

    @Column('text', { nullable: true })
    website: string;

    @Column('text', { nullable: true, name: 'facebook_profile_url' })
    facebookProfileUrl: string;

    @Column('text', { nullable: true, name: 'instagram_profile_url' })
    instagramProfileUrl: string;

    @Column('text', { nullable: true, name: 'x_profile_url' })
    xProfileUrl: string;

    @Column('text', { nullable: true, name: 'tiktok_profile_url' })
    tiktokProfileUrl: string;

    @Column('text', { nullable: true })
    location: string;

    @Column('text', { nullable: true, name: 'picture_url' })
    pictureUrl: string;

    @Column('text', { nullable: true, name: 'thumbnail_url' })
    thumbnailUrl: string;

    @OneToMany(() => Product, (product) => product.userProfile)
    product: Product;

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

    @OneToOne(() => User, (user) => user.profile)
    user: User;

    @OneToMany(() => Wishlist, (wishlist) => wishlist.profile)
    wishlists: Wishlist[];
}
