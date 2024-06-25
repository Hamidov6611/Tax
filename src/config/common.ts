export enum ErrorCode {
    INVALID_TOKEN = 'INVALID_TOKEN',
    NOT_FOUND = 'NOT_FOUND',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    LIMITED_PERMISSION = 'LIMITED_PERMISSION',
    DELETED_ITEM = 'DELETED_ITEM',
    INVALID_RELATION = 'INVALID_RELATION',
    UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
    INVALID_FIELD = 'INVALID_FIELD',
    TIME_OVERLAPPING = 'TIME_OVERLAPPING',
    ACTION_FAILED = 'ACTION_FAILED',
}
export interface PaginationParams {
    page: number;
    limit?: number;
}

export interface Pagination<T> {
    list: T[];
    count: number;
}
