import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { AllowedPermission } from '../auth/decorator/permission.decorator';
import { UsersService } from './users.service';
import { Permission } from '@prisma/client';
import { CreateUser, UpdateUser } from 'src/types/users';
import { CurrentUser, User } from 'src/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @AllowedPermission(Permission.USER_READ)
  @Get()
  async findAll() {
    return await this.usersService.getMany();
  }

  @AllowedPermission(Permission.USER_READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.findOneById(id);
  }

  @AllowedPermission(Permission.USER_WRITE)
  @Post()
  async createOne(@Body() body: CreateUser) {
    return this.usersService.createOne(body);
  }

  @AllowedPermission(Permission.USER_WRITE)
  @Put(':id')
  async updateOne(
    @Body() body: UpdateUser,
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: CurrentUser,
  ) {
    return this.usersService.updateOneUser(body, id, user);
  }

  @AllowedPermission(Permission.USER_WRITE)
  @Put('reset/:id')
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: CurrentUser,
  ) {
    return this.usersService.resetPassword(id, user);
  }

  @AllowedPermission(Permission.USER_WRITE)
  @Delete(':id')
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: CurrentUser,
  ) {
    return this.usersService.deleteOne(id, user);
  }
}
