import type { ICharacterFiltersState } from '@/entities/character/model/character-filters.interfaces.ts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: ICharacterFiltersState = {
  search: '',
  tags: [],
  universes: [],
  myTeamOnly: false,
};

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export const characterFiltersSlice = createSlice({
  name: 'characterFilters',
  initialState,
  reducers: {
    searchChanged: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    tagToggled: (state, action: PayloadAction<string>) => {
      state.tags = toggle(state.tags, action.payload);
    },
    universeToggled: (state, action: PayloadAction<string>) => {
      state.universes = toggle(state.universes, action.payload);
    },
    myTeamToggled: (state) => {
      state.myTeamOnly = !state.myTeamOnly;
    },
    filtersCleared: () => initialState,
  },
});

export const { searchChanged, tagToggled, universeToggled, myTeamToggled, filtersCleared } =
  characterFiltersSlice.actions;
