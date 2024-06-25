import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// export type CurrentUser = Request['user']
export type CurrentUser = {
  id: string;
  username: string;
};
export const User = createParamDecorator(
  (data: keyof CurrentUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: CurrentUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);