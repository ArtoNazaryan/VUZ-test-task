import { selectCharacterFilters } from '@/entities/character/index.ts';
import { CharacterFilters, ClearFiltersButton } from '@/features/character-filters/index.ts';
import { CharacterSearch } from '@/features/character-search/index.ts';
import { SquadPicker } from '@/features/squad-picker/index.ts';
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue.ts';
import { CharacterTable } from '@/widgets/character-table/index.ts';
import { Container, Stack, Typography } from '@mui/material';
import { type ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';

const SEARCH_DEBOUNCE_MS = 300;

export function SquadBuilderPage(): ReactElement {
  const filters = useSelector(selectCharacterFilters);
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);
  const queryFilters = useMemo(
    () => ({ search: debouncedSearch, tags: filters.tags, universes: filters.universes }),
    [debouncedSearch, filters.tags, filters.universes],
  );

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Stack spacing={4}>
        <Typography variant="h1" align="center">
          Select your squad to defend earthrealm
        </Typography>
        <SquadPicker />
        <CharacterSearch />
        <CharacterFilters />
        <CharacterTable
          filters={queryFilters}
          emptyAction={<ClearFiltersButton variant="outlined">Clear filters</ClearFiltersButton>}
        />
      </Stack>
    </Container>
  );
}
