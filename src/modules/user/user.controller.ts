import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(1, 2, 4)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(1, 2, 4)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('roleId') roleId?: number,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: number,
    @Query('divisionId') divisionId?: number,
    @Query('posId') posId?: number,
  ) {
    return this.userService.findAll(req.user, {
      page,
      limit,
      search,
      roleId,
      status,
      departmentId,
      divisionId,
      posId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  @Roles(1, 2, 4)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Put('updatestatus/:id')
  @Roles(1, 2, 4)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.userService.updateStatus(+id, actived);
  }

  @Put('changepassword/:id')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(+id, dto);
  }

  @Put('resetpassword/:id')
  @Roles(1, 2, 4)
  resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(+id);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Delete('deletefcm/:id')
  @Roles(1)
  removeFcmToken(@Param('id') id: string) {
    return this.userService.removeFcmToken(+id);
  }
}
