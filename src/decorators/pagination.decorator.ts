import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PaginationParams } from 'src/config/common';
import { PaginationLimit } from 'src/config/const';

export const getPagination = (
    pagination: PaginationParams,
): {
    skip: number;
    take: number;
} => ({
    skip: pagination.page * pagination.limit,
    take: pagination.limit,
});

export const paginate = (list: unknown[], count: number) => ({
    list,
    count,
});

export const Pagination = createParamDecorator((_, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    const page: number = parseInt(request.query['page'] as string) || 0;
    const limit: number =
        parseInt(request.query['limit'] as string) || PaginationLimit.min;

    return {
        page,
        limit: limit < PaginationLimit.max ? limit : PaginationLimit.max,
    };
});
