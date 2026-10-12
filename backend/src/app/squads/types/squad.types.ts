import type {
  SQUAD_DETAIL_SELECT,
  SQUAD_SUMMARY_SELECT,
} from '@app/squads/constants/squads.constants.js';
import type { SquadGetPayload } from '@infrastructure/prisma/generated/models.js';

export type TSquadSummaryRow = SquadGetPayload<{ select: typeof SQUAD_SUMMARY_SELECT }>;

export type TSquadDetailRow = SquadGetPayload<{ select: typeof SQUAD_DETAIL_SELECT }>;
