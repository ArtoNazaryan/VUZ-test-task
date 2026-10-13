import { useGetCharacterFiltersQuery } from '@/entities/character/index.ts';
import {
  selectActiveSquadId,
  SquadMemberAvatar,
  SquadStats,
  useGetSquadQuery,
} from '@/entities/squad/index.ts';
import { SquadHistoryButton } from '@/features/squad-history/index.ts';
import { SquadPicker } from '@/features/squad-picker/index.ts';
import { useRemoveSquadMember } from '@/features/toggle-squad-member/index.ts';
import { Stack, Typography } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';

export function SquadHeader(): ReactElement {
  const activeSquadId = useSelector(selectActiveSquadId);
  const { data: squad } = useGetSquadQuery(activeSquadId ?? skipToken);
  const { data: filterOptions } = useGetCharacterFiltersQuery(undefined);
  const removeSquadMember = useRemoveSquadMember();
  const characters = squad?.characters ?? [];
  const averages =
    squad?.stats.abilities ??
    (filterOptions?.abilities ?? []).map((name) => ({ name, average: null }));

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Typography variant="h1" align="center">
        {characters.length > 0 ? 'Your champions!' : 'Select your squad to defend earthrealm'}
      </Typography>
      <SquadPicker
        actions={activeSquadId ? <SquadHistoryButton squadId={activeSquadId} /> : undefined}
      />
      {characters.length > 0 && (
        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          role="list"
          aria-label="Squad members"
          sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {characters.map((character) => (
            <span key={character.id} role="listitem">
              <SquadMemberAvatar
                character={character}
                onRemove={(member) => {
                  if (activeSquadId) {
                    void removeSquadMember(activeSquadId, member);
                  }
                }}
              />
            </span>
          ))}
        </Stack>
      )}
      <SquadStats abilities={averages} />
    </Stack>
  );
}
