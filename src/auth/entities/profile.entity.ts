import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
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

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn({ name: 'user_uuid' })
    user: User;
}
