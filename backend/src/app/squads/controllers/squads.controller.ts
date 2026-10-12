import { CurrentUser } from '@app/auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import type { IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { CreateSquadDto } from '@app/squads/dto/create-squad.dto.js';
import type { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import type { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import { UpdateSquadDto } from '@app/squads/dto/update-squad.dto.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import {
  ApiCreateSquad,
  ApiDeleteSquad,
  ApiGetSquad,
  ApiListSquads,
  ApiUpdateSquad,
} from '@app/squads/swagger/squads.swagger.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Squads')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('squads')
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Get()
  @ApiListSquads()
  list(@CurrentUser() user: IAuthUser): Promise<SquadSummaryResponseDto[]> {
    return this.squadsService.list(user.id);
  }

  @Post()
  @ApiCreateSquad()
  create(@CurrentUser() user: IAuthUser, @Body() dto: CreateSquadDto): Promise<SquadResponseDto> {
    return this.squadsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiGetSquad()
  getById(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SquadResponseDto> {
    return this.squadsService.getById(id, user.id);
  }

  @Patch(':id')
  @ApiUpdateSquad()
  update(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSquadDto,
  ): Promise<SquadResponseDto> {
    return this.squadsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteSquad()
  remove(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.squadsService.remove(id, user.id);
  }
}
