import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Permission, Prisma, User } from '@prisma/client';
import { ErrorCode } from 'src/config/common';
import { DEFAULT_PASSWORD } from 'src/config/const';
import { CurrentUser } from 'src/decorators/user.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser, UpdateUser } from 'src/types/users';
import { hashPassword } from 'src/utils/auth';

type updateInput = Pick<
  Prisma.UserCreateInput,
  'firstName' | 'lastName' | 'phoneNumber' | 'refreshToken'
>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { ...userWhereUniqueInput, deletedAt: null },
    });
  }

  // Bu funksiya faqat backendda ishlatish uchun, frontenddan user yangilash updateOneUser funksiyasidan foydalaniladi
  async updateOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput, data: Partial<updateInput>): Promise<any> {
    return this.prisma.user.update({
      where: userWhereUniqueInput,
      data: data,
    });
  }

  async getMany() {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isSuperAdmin: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        permissions: true,
      },
    });
    return users;
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        permissions: true,
      },
    });

    if (!user)
      throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    return user;
  }

  async createOne(body: CreateUser, user: User) {
    if (!user.isSuperAdmin) {
      throw new BadRequestException(
        'You cannot create new users',
        ErrorCode.LIMITED_PERMISSION,
      )
    }
    return await this.prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        // TODO: Xozir hamma permissionlar yangi userga beriladi. Keyin tanlab qo'shish mumkin
        permissions: Object.values(Permission),
        phoneNumber: body.phoneNumber,
        password: await hashPassword(DEFAULT_PASSWORD),
      },
      select: {
        id: true,
        phoneNumber: true,
      },
    });
  }

  async updateOneUser(body: UpdateUser, id: string, currentUser: CurrentUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { deletedAt: true, isSuperAdmin: true },
    });

    if (!user)
      throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    if (user.deletedAt !== null)
      throw new BadRequestException(
        'You cannot update deleted item',
        ErrorCode.DELETED_ITEM,
      );
    if (user.isSuperAdmin || currentUser.id === id)
      throw new BadRequestException(
        'You cannot update this users',
        ErrorCode.LIMITED_PERMISSION,
      );

    console.log('BODY', body);

    await this.prisma.user.update({
      where: { id },
      data: {
        ...body,
      },
    });

    return {};
  }

  async deleteOne(id: string, currentUser: CurrentUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { deletedAt: true, isSuperAdmin: true },
    });

    if (!user)
      throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    if (user.deletedAt !== null)
      throw new BadRequestException(
        'You cannot delete deleted item',
        ErrorCode.DELETED_ITEM,
      );
    if (user.isSuperAdmin || currentUser.id === id) {
      console.log('USER', user, currentUser);
      throw new BadRequestException(
        'You cannot delete this users',
        ErrorCode.LIMITED_PERMISSION,
      );
    }
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {};
  }

  async resetPassword(id: string, currentUser: CurrentUser) {
    if (currentUser.id === id)
      throw new BadRequestException(
        'You cannot reset your password',
        ErrorCode.LIMITED_PERMISSION,
      );

    return this.prisma.user.update({
      where: { id, isSuperAdmin: false },
      data: {
        password: await hashPassword(DEFAULT_PASSWORD),
      },
      select: {
        id: true,
      },
    });
  }
}
