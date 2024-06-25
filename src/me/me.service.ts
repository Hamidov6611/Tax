import { BadRequestException, Injectable } from '@nestjs/common';
import { comparePassword, hashPassword } from '../utils/auth';
import { PrismaService } from '../prisma/prisma.service';
import { changePasswordDto } from 'src/types/me';

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  async getMe(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        permissions: true,
      },
    });
  }

  async changePassword(id: string, passwords: changePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        password: true,
      },
    });
    const isValid = await comparePassword(passwords.oldPassword, user.password);

    if (isValid) {
      console.log('Changing');
      await this.prisma.user.update({
        where: { id },
        data: {
          password: await hashPassword(passwords.newPassword),
        },
      });

      return {};
    } else throw new BadRequestException();
  }
}
