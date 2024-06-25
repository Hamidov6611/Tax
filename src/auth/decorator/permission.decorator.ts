import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const AllowedPermission = (permission: Permission) => SetMetadata('permission', permission)