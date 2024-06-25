import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../public-auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from 'src/config/common';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject('Reflector') private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request: Request = context.switchToHttp().getRequest();


        return this.authService.validateToken(request);
    }
}
