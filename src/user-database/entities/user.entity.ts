import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Profile } from './profile.entity';
import { Role } from '../../auth/interfaces/auth.interfaces';

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

    @Column({ nullable: true })
    birth_date: Date;

    @Column({ nullable: true })
    ip_address: string;

    @Column('bool', { nullable: false, default: true })
    is_active: boolean;

    @Column('enum', {
        enum: Role,
        array: true,
        default: [Role.USER],
    })
    roles: Role[];

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
