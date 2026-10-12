import {
  SQUAD_DETAIL_SELECT,
  SQUAD_SUMMARY_SELECT,
} from '@app/squads/constants/squads.constants.js';
import type { TSquadDetailRow, TSquadSummaryRow } from '@app/squads/types/squad.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SquadsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAllByUser(userId: string): Promise<TSquadSummaryRow[]> {
    return this.prismaService.squad.findMany({
      where: { userId },
      select: SQUAD_SUMMARY_SELECT,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  findOwned(id: string, userId: string): Promise<TSquadDetailRow | null> {
    return this.prismaService.squad.findFirst({
      where: { id, userId },
      select: SQUAD_DETAIL_SELECT,
    });
  }

  async create(userId: string, name: string): Promise<string> {
    const squad = await this.prismaService.squad.create({
      data: { userId, name },
      select: { id: true },
    });

    return squad.id;
  }

  async renameOwned(id: string, userId: string, name: string): Promise<boolean> {
    const result = await this.prismaService.squad.updateMany({
      where: { id, userId },
      data: { name },
    });

    return result.count === 1;
  }

  async deleteOwned(id: string, userId: string): Promise<boolean> {
    const result = await this.prismaService.squad.deleteMany({ where: { id, userId } });

    return result.count === 1;
  }
}
