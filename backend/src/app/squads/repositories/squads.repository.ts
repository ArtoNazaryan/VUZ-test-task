import {
  SQUAD_DETAIL_SELECT,
  SQUAD_SUMMARY_SELECT,
} from '@app/squads/constants/squads.constants.js';
import { findAddMemberViolation } from '@app/squads/helpers/squad-rules.helper.js';
import type {
  IAddMemberResult,
  IPickCount,
  IRemoveMemberResult,
  ISquadMemberChanges,
} from '@app/squads/interfaces/squad-rules.interfaces.js';
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

  async existsOwned(id: string, userId: string): Promise<boolean> {
    return (await this.prismaService.squad.count({ where: { id, userId } })) > 0;
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

  addMemberOwned(id: string, userId: string, characterId: number): Promise<IAddMemberResult> {
    return this.prismaService.$transaction(async (transaction) => {
      if (!(await this.lockOwned(transaction, id, userId))) {
        return { squadFound: false, violation: null };
      }

      const members = await transaction.squadMember.findMany({
        where: { squadId: id },
        select: { characterId: true },
      });
      const violation = findAddMemberViolation(
        members.map((member) => member.characterId),
        characterId,
      );

      if (violation) {
        return { squadFound: true, violation };
      }

      await transaction.squadMember.create({ data: { squadId: id, characterId } });
      await transaction.squad.update({ where: { id }, data: { updatedAt: new Date() } });

      return { squadFound: true, violation: null };
    });
  }

  removeMemberOwned(id: string, userId: string, characterId: number): Promise<IRemoveMemberResult> {
    return this.prismaService.$transaction(async (transaction) => {
      if (!(await this.lockOwned(transaction, id, userId))) {
        return { squadFound: false, removed: false };
      }

      const result = await transaction.squadMember.deleteMany({
        where: { squadId: id, characterId },
      });

      if (result.count > 0) {
        await transaction.squad.update({ where: { id }, data: { updatedAt: new Date() } });
      }

      return { squadFound: true, removed: result.count > 0 };
    });
  }

  async findMostPicked(limit: number): Promise<IPickCount[]> {
    const groups = await this.prismaService.squadMember.groupBy({
      by: ['characterId'],
      _count: { characterId: true },
      orderBy: [{ _count: { characterId: 'desc' } }, { characterId: 'asc' }],
      take: limit,
    });

    return groups.map((group) => ({
      characterId: group.characterId,
      pickCount: group._count.characterId,
    }));
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
