import { formatAverage } from '@/entities/squad/lib/squad-stats.helper.ts';
import type { ISquadAbilityAverage } from '@/entities/squad/model/squad.interfaces.ts';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { Fragment, type ReactElement } from 'react';

const DIVIDER_BEFORE = new Set(['Technique', 'Survivability']);

interface ISquadStatsProps {
  abilities: ISquadAbilityAverage[];
}

export function SquadStats({ abilities }: ISquadStatsProps): ReactElement {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Stack direction="row" role="list" aria-label="Squad averages" sx={{ alignItems: 'stretch' }}>
        {abilities.map((ability) => (
          <Fragment key={ability.name}>
            {DIVIDER_BEFORE.has(ability.name) && <Divider orientation="vertical" flexItem />}
            <Box role="listitem" sx={{ px: { xs: 1, sm: 2 }, textAlign: 'center', minWidth: 72 }}>
              <Typography variant="body2" color="text.secondary">
                {ability.name}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', mt: 0.5 }}>
                {formatAverage(ability.average)}
              </Typography>
            </Box>
          </Fragment>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        * Totals as average for squad
      </Typography>
    </Stack>
  );
}
