import type { ISquadSummary } from '@/entities/squad/index.ts';
import type { ReactNode } from 'react';

export interface IActiveSquadBootstrap {
  squads: ISquadSummary[];
  activeSquadId: string | null;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

export interface ISquadPickerProps {
  actions?: ReactNode;
}
