import {
  CharacterAvatar,
  searchChanged,
  useGetPopularityQuery,
} from '@/entities/character/index.ts';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { Chip, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

const VISIBLE_PICKS = 5;

export function PopularityStrip(): ReactElement | null {
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useGetPopularityQuery(undefined);
  const topPicks = data?.items.slice(0, VISIBLE_PICKS) ?? [];

  if (isError) {
    return null;
  }

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <LocalFireDepartmentIcon color="error" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Most picked right now
        </Typography>
      </Stack>
      {isLoading && <Skeleton variant="rounded" width={320} height={32} />}
      {!isLoading && topPicks.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No picks yet, be the first
        </Typography>
      )}
      {topPicks.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          role="list"
          aria-label="Most picked characters"
          sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {topPicks.map((pick) => (
            <Chip
              key={pick.character.id}
              role="listitem"
              avatar={<CharacterAvatar character={pick.character} size={24} />}
              label={`${pick.character.name} · ${String(pick.pickCount)}`}
              variant="outlined"
              onClick={() => dispatch(searchChanged(pick.character.name))}
              sx={{ bgcolor: 'background.paper' }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
