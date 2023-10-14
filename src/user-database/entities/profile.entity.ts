import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Gender } from '../interfaces/user-databse.interfaces';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column('text', { nullable: true })
    inactive_reason: string;

    @Column('enum', {
        enum: Gender,
        array: true,
        nullable: true,
    })
    gender: string;

    @Column('text', { nullable: true })
    website;

    @Column('text', { nullable: true })
    facebook_profile: string;

    @Column('text', { nullable: true })
    instagram_profile: string;

    @Column('text', { nullable: true })
    x_profile;

    @Column('text', { nullable: true })
    tiktok_profile: string;

    @Column('text', { nullable: true })
    location: string;

    @Column('text', { nullable: true })
    picture_url: string;

    @Column('text', { nullable: true })
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

    @OneToOne(() => User, (user) => user.profile)
    user: User;
}
