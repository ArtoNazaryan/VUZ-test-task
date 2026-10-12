import type { PopularityResponseDto } from '@app/popularity/dto/popularity-response.dto.js';
import { PopularityService } from '@app/popularity/services/popularity.service.js';
import {
  ApiGetPopularity,
  ApiPopularityController,
} from '@app/popularity/swagger/popularity.swagger.js';
import { Controller, Get } from '@nestjs/common';

@ApiPopularityController()
@Controller('popularity')
export class PopularityController {
  constructor(private readonly popularityService: PopularityService) {}

  @Get()
  @ApiGetPopularity()
  getPopularity(): Promise<PopularityResponseDto> {
    return this.popularityService.getSnapshot();
  }
}
