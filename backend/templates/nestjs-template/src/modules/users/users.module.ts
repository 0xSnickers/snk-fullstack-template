import { Module } from '@nestjs/common';
import { TokenModule } from '../auth/token.module';
import { DemoUserSeeder } from './demo-user.seeder';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TokenModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, DemoUserSeeder],
  exports: [UsersService],
})
export class UsersModule {}
