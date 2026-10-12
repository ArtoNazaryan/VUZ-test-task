import { MAX_ABILITY_SCORE } from '@/entities/character/model/character.constants.ts';
import { Typography } from '@mui/material';
import type { ReactElement } from 'react';

interface IAbilityScoreProps {
  score: number;
}

export function AbilityScore({ score }: IAbilityScoreProps): ReactElement {
  const isMax = score === MAX_ABILITY_SCORE;

  return (
    <Typography
      component="span"
      data-max={isMax || undefined}
      sx={{ fontWeight: 700, fontSize: '1.125rem', color: isMax ? 'error.main' : 'text.primary' }}
    >
      {score}
    </Typography>
  );
}
