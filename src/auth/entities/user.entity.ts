import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../interfaces/auth.interfaces';

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

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}
