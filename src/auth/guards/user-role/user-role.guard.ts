import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../interfaces/auth.interfaces';
import { META_ROLES_KEY } from '../../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            throw new InternalServerErrorException('User not found (request)');

        const userRoles: Role[] = user.roles;
        const validRoles: Role[] = this.reflector.get(
            META_ROLES_KEY,
            context.getHandler(),
        );
        if (!validRoles) return true;
        if (validRoles.length === 0) return true;
        for (const role of userRoles) {
            if (validRoles.includes(role)) return true;
        }

        throw new ForbiddenException(
            'You do not have permission, need a valid role to access this route',
        );
    }
}
