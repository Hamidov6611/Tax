import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { PermissionsGuard } from './auth/guards/permission.guard';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule
  ],
  controllers: [],
  providers: [
    PrismaModule,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule { }
