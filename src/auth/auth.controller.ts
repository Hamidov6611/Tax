import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public-auth.decorator';
import { LoginDto, RefreshTokenDto } from 'src/types/auth';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('auth/login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('auth/refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }
}
