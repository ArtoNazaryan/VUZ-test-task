import { PickStatsQueryDto } from '@app/activity/dto/pick-stats-query.dto.js';
import type { PickStatsResponseDto } from '@app/activity/dto/pick-stats-response.dto.js';
import { SquadHistoryQueryDto } from '@app/activity/dto/squad-history-query.dto.js';
import type { SquadHistoryResponseDto } from '@app/activity/dto/squad-history-response.dto.js';
import { ActivityService } from '@app/activity/services/activity.service.js';
import {
  ApiActivityController,
  ApiGetPickStats,
  ApiGetSquadHistory,
} from '@app/activity/swagger/activity.swagger.js';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import type { IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';

@ApiActivityController()
@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('squads/:id/history')
  @UseGuards(JwtAuthGuard)
  @ApiGetSquadHistory()
  getSquadHistory(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SquadHistoryQueryDto,
  ): Promise<SquadHistoryResponseDto> {
    return this.activityService.getSquadHistory(id, user.id, query);
  }

  @Get('stats/picks')
  @ApiGetPickStats()
  getPickStats(@Query() query: PickStatsQueryDto): Promise<PickStatsResponseDto> {
    return this.activityService.getPickStats(query.days);
  }
}
