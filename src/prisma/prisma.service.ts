import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { ErrorCode } from 'src/config/common';

const errorList = {
    ['P2003']: {
        message: `Relational field is invalid constraint failed`,
        errorCode: ErrorCode.INVALID_RELATION,
    },
    ['P2025']: {
        message: `Relational field is invalid constraint failed`,
        errorCode: ErrorCode.INVALID_RELATION,
    },
    ['P2002']: {
        message: `Unique constraint failed`,
        errorCode: ErrorCode.UNIQUE_CONSTRAINT,
    },
};

const customConstraints = [
    {
        constraint: 'prevent_double_appointment',
        message: 'Times overlapping',
        errorCode: ErrorCode.TIME_OVERLAPPING,
    },
    {
        constraint: 'start_time_before_finish_time',
        message: 'Start time is before finish time',
        errorCode: ErrorCode.INVALID_RELATION,
    },
];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();

        this.$use(async (params, next) => {
            // See results here
            return await next(params).catch((e) => {
                if (e instanceof PrismaClientKnownRequestError) {
                    // The .code property can be accessed in a type-safe manner

                    const error = errorList[e.code];

                    if (error) {
                        throw new BadRequestException(error.message, error.errorCode);
                    }
                }
                if (e instanceof PrismaClientUnknownRequestError) {
                    customConstraints.forEach((item) => {
                        if (e.message.includes(item.constraint))
                            throw new BadRequestException(item.message, item.errorCode);
                    });
                }
                throw e;
            });
        });
    }
}
