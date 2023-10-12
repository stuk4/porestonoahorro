import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', { unique: true, nullable: false })
    email: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column('bool', { nullable: false, default: true })
    is_active: boolean;

    @Column('text', { nullable: true })
    picture_url: string;

    @Column('text', { nullable: true })
    thumbnail_url: string;

    @OneToOne(() => User, (user) => user.profile)
    user: User;
}
