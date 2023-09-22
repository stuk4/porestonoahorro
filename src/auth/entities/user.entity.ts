import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../interfaces/auth.interfaces';
import { Profile } from './profile.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text', { unique: true, nullable: false })
    email: string;

    @Column('text', { nullable: false, select: false })
    password: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ nullable: false })
    full_name: string;

    @Column('bool', { nullable: false, default: true })
    is_active: boolean;

    @Column('enum', {
        enum: Role,
        array: true,
        default: [Role.USER],
    })
    roles: Role[];

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: true,
        nullable: true,
        eager: true,
    })
    @JoinColumn({ name: 'profile_uuid' })
    profile: Profile;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}
