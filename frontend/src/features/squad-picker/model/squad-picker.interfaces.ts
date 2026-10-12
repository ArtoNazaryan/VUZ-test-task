import type { ISquadSummary } from '@/entities/squad/index.ts';

export interface IActiveSquadBootstrap {
  squads: ISquadSummary[];
  activeSquadId: string | null;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}
