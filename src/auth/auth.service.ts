import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request } from 'express';
import { ErrorCode } from 'src/config/common';
import { JWT_REFRESH_SECRET, JWT_SECRET, TokenExpirationTimes } from 'src/config/const';
import { LoginDto, RefreshTokenDto } from 'src/types/auth';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, pass: string): Promise<null | Partial<User>> {
    const user = await this.usersService.findOne({
      phoneNumber,
    });
    if (user && (await comparePassword(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
  }

  async login(body: LoginDto) {
    const user = await this.validateUser(body.phoneNumber, body.password);

    if (user) {
      return this.generateTokens(user);
    }
  }
  
  async validateToken(request: Request): Promise<boolean> {
    const token = request.headers['authorization']?.toString();
    if (!token) throw new UnauthorizedException();

    const payload = this.jwtService.decode(token);
    if (typeof payload === 'string' || !payload) {
      return false;
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new UnauthorizedException('Expired token', ErrorCode.EXPIRED_TOKEN);
    }

    await this.jwtService
      .verifyAsync(token, {
        secret: JWT_SECRET,
        ignoreExpiration: false,
      })
      .catch(() => {
        throw new UnauthorizedException(
          'Token is invalid',
          ErrorCode.INVALID_TOKEN,
        );
      });

    const user = await this.usersService
      .findOne({ id: payload.id })
      .catch(() => {
        throw UnauthorizedException;
      });

    if (!user) {
      throw new UnauthorizedException(
        'Token is invalid',
        ErrorCode.INVALID_TOKEN,
      );
    }

    // Bu joyda user objecti requestga qo'shiladi, shu orqali currentUser controllerda mavjud bo'ladi
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, updatedAt, deletedAt, ...rest } = user;
    request['user'] = rest;
    return true;
  }

  async generateTokens(
    user: Partial<User>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      phoneNumber: user.phoneNumber,
      id: user.id,
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: TokenExpirationTimes.refresh,
    });

    // const hashedRefreshToken = await hashRefreshToken(refreshToken);

    await this.usersService.updateOne(
      {
        id: user.id,
      },
      {
        refreshToken: refreshToken,
      },
    );

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: JWT_SECRET,
        expiresIn: TokenExpirationTimes.access,
      }),
      refreshToken,
    };
  }

  async refreshToken(body: RefreshTokenDto) {
    const refreshToken = body.refreshToken;
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: JWT_REFRESH_SECRET,
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new UnauthorizedException(
        "Token is invalid, can't verify",
        ErrorCode.INVALID_TOKEN,
      );
    }

    const payload = this.jwtService.decode(refreshToken);
    if (typeof payload === 'string') {
      throw new UnauthorizedException(
        'Token is invalid, payload is string',
        ErrorCode.INVALID_TOKEN,
      );
    }

    const user = await this.usersService.findOne({
      id: payload.id,
    });

    if (refreshToken === user.refreshToken) {
      return await this.generateTokens(user);
    } else {
      throw new UnauthorizedException(
        "Token is invalid, refresh token didn't match",
        ErrorCode.INVALID_TOKEN,
      );
    }
  }

}
