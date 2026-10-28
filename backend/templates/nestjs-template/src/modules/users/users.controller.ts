import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UuidPipe } from '../../common/http/pipes';
import { PageQueryDto } from '../../common/page';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UsersService } from './users.service';

@Controller('v1/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.users.list(query);
  }

  @Get(':id')
  get(@Param('id', UuidPipe) id: string) {
    return this.users.get(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', UuidPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', UuidPipe) id: string) {
    return this.users.remove(id);
  }
}
