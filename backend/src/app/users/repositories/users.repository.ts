import { USER_SELECT } from '@app/users/constants/users.constants.js';
import type { TUserRow } from '@app/users/types/user.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(email: string, passwordHash: string): Promise<TUserRow> {
    return this.prismaService.user.create({ data: { email, passwordHash }, select: USER_SELECT });
  }

  findByEmail(email: string): Promise<TUserRow | null> {
    return this.prismaService.user.findUnique({ where: { email }, select: USER_SELECT });
  }

  findById(id: string): Promise<TUserRow | null> {
    return this.prismaService.user.findUnique({ where: { id }, select: USER_SELECT });
  }
}
