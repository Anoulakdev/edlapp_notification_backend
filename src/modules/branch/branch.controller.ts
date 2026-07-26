import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branchs')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(2, 3, 4)
  create(@Req() req: UserRequest, @Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(req.user, createBranchDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll() {
    return this.branchService.findAll();
  }

  @Get('selectbranch')
  selectBranch() {
    return this.branchService.selectBranch();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4)
  update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchService.update(req.user, +id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(2, 3, 4)
  remove(@Param('id') id: string) {
    return this.branchService.remove(+id);
  }
}
