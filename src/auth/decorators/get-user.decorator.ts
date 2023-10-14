import {
    ExecutionContext,
    InternalServerErrorException,
    createParamDecorator,
} from '@nestjs/common';
import { User } from '../../user-database/entities/user.entity';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            throw new InternalServerErrorException('User not found (request)');

        if (data) return user[data];

        return user as User;
    },
);
