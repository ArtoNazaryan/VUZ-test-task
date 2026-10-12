import { CharactersService } from '@app/characters/services/characters.service.js';
import type { CreateSquadDto } from '@app/squads/dto/create-squad.dto.js';
import type { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import type { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import type { UpdateSquadDto } from '@app/squads/dto/update-squad.dto.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import {
  squadNotFoundError,
  toMemberConflictError,
  toSquadNameConflictError,
  toSquadRuleError,
} from '@app/squads/helpers/squad-errors.helper.js';
import { findSquadRuleViolation } from '@app/squads/helpers/squad-rules.helper.js';
import { computeSquadStats } from '@app/squads/helpers/squad-stats.helper.js';
import type {
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';
import type {
  IAddMemberResult,
  IPickCount,
} from '@app/squads/interfaces/squad-rules.interfaces.js';
import { toSquadResponse, toSquadSummaryResponse } from '@app/squads/mappers/squad.mapper.js';
import { SquadsRepository } from '@app/squads/repositories/squads.repository.js';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SquadsService {
  constructor(
    private readonly squadsRepository: SquadsRepository,
    private readonly charactersService: CharactersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getMostPicked(limit: number): Promise<IPickCount[]> {
    return this.squadsRepository.findMostPicked(limit);
  }

  async list(userId: string): Promise<SquadSummaryResponseDto[]> {
    const rows = await this.squadsRepository.findAllByUser(userId);

    return rows.map(toSquadSummaryResponse);
  }

  async getById(id: string, userId: string): Promise<SquadResponseDto> {
    const row = await this.squadsRepository.findOwned(id, userId);

    if (!row) {
      throw squadNotFoundError();
    }

    const [characters, filters] = await Promise.all([
      this.charactersService.getManyByIds(row.members.map((member) => member.characterId)),
      this.charactersService.getFilters(),
    ]);

    return toSquadResponse(row, characters, computeSquadStats(characters, filters.abilities));
  }

  async create(userId: string, dto: CreateSquadDto): Promise<SquadResponseDto> {
    const characterIds = dto.characterIds ?? [];

    await this.assertValidMembers(characterIds);

    let id: string;

    try {
      id = await this.squadsRepository.create(userId, dto.name, characterIds);
    } catch (error) {
      throw toSquadNameConflictError(error);
    }

    this.emitSquadEvent(SquadEvent.Created, { squadId: id, userId, occurredAt: new Date() });

    return this.getById(id, userId);
  }

  async update(id: string, userId: string, dto: UpdateSquadDto): Promise<SquadResponseDto> {
    if (dto.characterIds) {
      await this.assertValidMembers(dto.characterIds);
    }

    let updated: boolean;

    try {
      updated = await this.squadsRepository.updateOwned(id, userId, {
        name: dto.name,
        characterIds: dto.characterIds,
      });
    } catch (error) {
      throw toSquadNameConflictError(error);
    }

    if (!updated) {
      throw squadNotFoundError();
    }

    this.emitSquadEvent(SquadEvent.Updated, { squadId: id, userId, occurredAt: new Date() });

    return this.getById(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!(await this.squadsRepository.deleteOwned(id, userId))) {
      throw squadNotFoundError();
    }

    this.emitSquadEvent(SquadEvent.Deleted, { squadId: id, userId, occurredAt: new Date() });
  }

  async addMember(id: string, userId: string, characterId: number): Promise<SquadResponseDto> {
    await this.assertValidMembers([characterId]);

    let result: IAddMemberResult;

    try {
      result = await this.squadsRepository.addMemberOwned(id, userId, characterId);
    } catch (error) {
      throw toMemberConflictError(error, characterId);
    }

    if (!result.squadFound) {
      throw squadNotFoundError();
    }

    if (result.violation) {
      throw toSquadRuleError(result.violation);
    }

    this.emitMemberEvent(SquadEvent.MemberAdded, {
      squadId: id,
      userId,
      characterId,
      occurredAt: new Date(),
    });

    return this.getById(id, userId);
  }

  async removeMember(id: string, userId: string, characterId: number): Promise<SquadResponseDto> {
    const result = await this.squadsRepository.removeMemberOwned(id, userId, characterId);

    if (!result.squadFound) {
      throw squadNotFoundError();
    }

    if (result.removed) {
      this.emitMemberEvent(SquadEvent.MemberRemoved, {
        squadId: id,
        userId,
        characterId,
        occurredAt: new Date(),
      });
    }

    return this.getById(id, userId);
  }

  private async assertValidMembers(characterIds: number[]): Promise<void> {
    const violation = findSquadRuleViolation(
      characterIds,
      await this.charactersService.findExistingIds(characterIds),
    );

    if (violation) {
      throw toSquadRuleError(violation);
    }
  }

  private emitSquadEvent(event: SquadEvent, payload: ISquadEventPayload): void {
    this.eventEmitter.emit(event, payload);
  }

  private emitMemberEvent(event: SquadEvent, payload: ISquadMemberEventPayload): void {
    this.eventEmitter.emit(event, payload);
  }
}
