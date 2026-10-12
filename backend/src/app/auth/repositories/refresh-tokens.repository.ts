import { REFRESH_TOKEN_SELECT } from '@app/auth/constants/refresh-token-select.constants.js';
import type { TRefreshTokenRow } from '@app/auth/types/refresh-token.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prismaService.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findByHash(tokenHash: string): Promise<TRefreshTokenRow | null> {
    return this.prismaService.refreshToken.findUnique({
      where: { tokenHash },
      select: REFRESH_TOKEN_SELECT,
    });
  }

  async revokeIfActive(id: string, revokedAt: Date): Promise<boolean> {
    const result = await this.prismaService.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt },
    });

    return result.count === 1;
  }

  async revokeByHash(tokenHash: string, revokedAt: Date): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt },
    });
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<number> {
    const result = await this.prismaService.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt },
    });

    return result.count;
  }
}
