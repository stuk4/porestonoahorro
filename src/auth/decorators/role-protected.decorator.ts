import { SetMetadata } from '@nestjs/common';
import { Role } from '../interfaces/auth.interfaces';

export const META_ROLES_KEY = 'roles';
export const RoleProtected = (...args: Role[]) => {
    return SetMetadata(META_ROLES_KEY, args);
};
