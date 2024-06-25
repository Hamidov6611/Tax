import { Body, Controller, Get, Post } from '@nestjs/common';
import { MeService } from './me.service';
import { changePasswordDto } from 'src/types/me';
import { User } from 'src/decorators/user.decorator';

@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @Get()
  getMe(@User('id') id: string) {
    return this.meService.getMe(id);
  }

  @Post('password')
  changePassword(@Body() body: changePasswordDto, @User('id') id: string) {
    return this.meService.changePassword(id, body);
  }
}
