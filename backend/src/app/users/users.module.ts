import { UsersRepository } from '@app/users/repositories/users.repository.js';
import { UsersService } from '@app/users/services/users.service.js';
import { Module } from '@nestjs/common';

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
