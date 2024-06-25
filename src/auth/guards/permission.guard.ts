import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../public-auth.decorator';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const permission = this.reflector.get<Permission | undefined>(
            'permission',
            context.getHandler(),
        );
        if (!permission) return true;

        const request: Request = context.switchToHttp().getRequest();
        const user = request['user'];
        console.log(user)
        if (user.isSuperAdmin) return true;
        return user.permissions.some((p) => p === permission);
    }
}
