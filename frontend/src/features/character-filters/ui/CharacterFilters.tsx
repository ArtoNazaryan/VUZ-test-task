import {
  selectCharacterFilters,
  myTeamToggled,
  selectHasActiveFilters,
  tagToggled,
  universeToggled,
  useGetCharacterFiltersQuery,
} from '@/entities/character/index.ts';
import { ClearFiltersButton } from '@/features/character-filters/ui/ClearFiltersButton.tsx';
import { FilterPill } from '@/features/character-filters/ui/FilterPill.tsx';
import { capitalize } from '@/shared/lib/helpers/text.helper.ts';
import { Skeleton, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const SKELETON_PILLS = 12;

export function CharacterFilters(): ReactElement {
  const dispatch = useDispatch();
  const { tags, universes, myTeamOnly } = useSelector(selectCharacterFilters);
  const hasActiveFilters = useSelector(selectHasActiveFilters);
  const { data: options, isLoading, isError } = useGetCharacterFiltersQuery(undefined);

  if (isError) {
    return (
      <Typography variant="body2" color="error" align="center">
        Filters are not available right now
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5} role="group" aria-label="Filters">
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {isLoading
          ? Array.from({ length: SKELETON_PILLS }, (_, index) => (
              <Skeleton key={index} variant="rounded" width={72} height={32} />
            ))
          : options?.tags.map((tag) => (
              <FilterPill
                key={tag}
                label={capitalize(tag)}
                isSelected={tags.includes(tag)}
                onToggle={() => dispatch(tagToggled(tag))}
              />
            ))}
        {!isLoading && (
          <FilterPill
            label="My Team"
            isSelected={myTeamOnly}
            onToggle={() => dispatch(myTeamToggled())}
          />
        )}
      </Stack>
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{ flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
      >
        {options?.universes.map((universe) => (
          <FilterPill
            key={universe}
            label={universe}
            isSelected={universes.includes(universe)}
            onToggle={() => dispatch(universeToggled(universe))}
          />
        ))}
        <ClearFiltersButton
          size="small"
          color="inherit"
          disabled={!hasActiveFilters}
          sx={{ textDecoration: 'underline', color: 'text.secondary' }}
        >
          Clear all
        </ClearFiltersButton>
      </Stack>
    </Stack>
  );
}
