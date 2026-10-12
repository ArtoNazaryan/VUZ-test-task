import {
  SQUAD_DETAIL_SELECT,
  SQUAD_SUMMARY_SELECT,
} from '@app/squads/constants/squads.constants.js';
import type { ISquadMemberChanges } from '@app/squads/interfaces/squad-rules.interfaces.js';
import type { TSquadDetailRow, TSquadSummaryRow } from '@app/squads/types/squad.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import type { TPrismaTransaction } from '@infrastructure/prisma/types/prisma.types.js';
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

  async create(userId: string, name: string, characterIds: number[]): Promise<string> {
    const addedAt = Date.now();
    const squad = await this.prismaService.squad.create({
      data: {
        userId,
        name,
        members: {
          create: characterIds.map((characterId, index) => ({
            characterId,
            addedAt: new Date(addedAt + index),
          })),
        },
      },
      select: { id: true },
    });

    return squad.id;
  }

  updateOwned(id: string, userId: string, changes: ISquadMemberChanges): Promise<boolean> {
    return this.prismaService.$transaction(async (transaction) => {
      if (!(await this.lockOwned(transaction, id, userId))) {
        return false;
      }

      if (changes.characterIds) {
        const addedAt = Date.now();

        await transaction.squadMember.deleteMany({ where: { squadId: id } });
        await transaction.squadMember.createMany({
          data: changes.characterIds.map((characterId, index) => ({
            squadId: id,
            characterId,
            addedAt: new Date(addedAt + index),
          })),
        });
      }

      await transaction.squad.update({
        where: { id },
        data: {
          ...(changes.name === undefined ? {} : { name: changes.name }),
          updatedAt: new Date(),
        },
      });

      return true;
    });
  }

  async deleteOwned(id: string, userId: string): Promise<boolean> {
    const result = await this.prismaService.squad.deleteMany({ where: { id, userId } });

    return result.count === 1;
  }

  private async lockOwned(
    transaction: TPrismaTransaction,
    id: string,
    userId: string,
  ): Promise<boolean> {
    const rows = await transaction.$queryRaw<{ id: string }[]>`
      SELECT id FROM squads WHERE id = ${id}::uuid AND user_id = ${userId}::uuid FOR UPDATE
    `;

    return rows.length === 1;
  }
}
