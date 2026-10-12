import { normalizeEmail } from '@app/users/helpers/email.helper.js';
import { UsersRepository } from '@app/users/repositories/users.repository.js';
import type { TUserRow } from '@app/users/types/user.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { isUniqueViolation } from '@infrastructure/prisma/helpers/prisma-error.helper.js';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(email: string, passwordHash: string): Promise<TUserRow> {
    try {
      return await this.usersRepository.create(normalizeEmail(email), passwordHash);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppException(
          ErrorCode.EmailTaken,
          'An account with this email already exists',
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }
  }

  findByEmail(email: string): Promise<TUserRow | null> {
    return this.usersRepository.findByEmail(normalizeEmail(email));
  }

  findById(id: string): Promise<TUserRow | null> {
    return this.usersRepository.findById(id);
  }
}
