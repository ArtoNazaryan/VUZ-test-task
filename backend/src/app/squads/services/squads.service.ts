import { CharactersService } from '@app/characters/services/characters.service.js';
import type { CreateSquadDto } from '@app/squads/dto/create-squad.dto.js';
import type { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import type { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import type { UpdateSquadDto } from '@app/squads/dto/update-squad.dto.js';
import {
  squadNotFoundError,
  toSquadNameConflictError,
} from '@app/squads/helpers/squad-errors.helper.js';
import { toSquadResponse, toSquadSummaryResponse } from '@app/squads/mappers/squad.mapper.js';
import { SquadsRepository } from '@app/squads/repositories/squads.repository.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SquadsService {
  constructor(
    private readonly squadsRepository: SquadsRepository,
    private readonly charactersService: CharactersService,
  ) {}

  async list(userId: string): Promise<SquadSummaryResponseDto[]> {
    const rows = await this.squadsRepository.findAllByUser(userId);

    return rows.map(toSquadSummaryResponse);
  }

  async getById(id: string, userId: string): Promise<SquadResponseDto> {
    const row = await this.squadsRepository.findOwned(id, userId);

    if (!row) {
      throw squadNotFoundError();
    }

    const characters = await this.charactersService.getManyByIds(
      row.members.map((member) => member.characterId),
    );

    return toSquadResponse(row, characters);
  }

  async create(userId: string, dto: CreateSquadDto): Promise<SquadResponseDto> {
    try {
      const id = await this.squadsRepository.create(userId, dto.name);

      return await this.getById(id, userId);
    } catch (error) {
      throw toSquadNameConflictError(error);
    }
  }

  async update(id: string, userId: string, dto: UpdateSquadDto): Promise<SquadResponseDto> {
    try {
      const renamed = await this.squadsRepository.renameOwned(id, userId, dto.name);

      if (!renamed) {
        throw squadNotFoundError();
      }

      return await this.getById(id, userId);
    } catch (error) {
      throw toSquadNameConflictError(error);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!(await this.squadsRepository.deleteOwned(id, userId))) {
      throw squadNotFoundError();
    }
  }
}
