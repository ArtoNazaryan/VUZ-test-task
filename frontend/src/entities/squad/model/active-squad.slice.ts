import type { IActiveSquadState } from '@/entities/squad/model/squad.interfaces.ts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: IActiveSquadState = { squadId: null };

export const activeSquadSlice = createSlice({
  name: 'activeSquad',
  initialState,
  reducers: {
    activeSquadChanged: (state, action: PayloadAction<string | null>) => {
      state.squadId = action.payload;
    },
  },
});

export const { activeSquadChanged } = activeSquadSlice.actions;

export const selectActiveSquadId = (state: { activeSquad: IActiveSquadState }): string | null =>
  state.activeSquad.squadId;
