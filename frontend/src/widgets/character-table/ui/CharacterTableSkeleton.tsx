import { Skeleton, Stack, TableCell, TableRow } from '@mui/material';
import type { ReactElement } from 'react';

interface ICharacterTableSkeletonProps {
  rows: number;
  abilityCount: number;
}

export function CharacterTableSkeleton({
  rows,
  abilityCount,
}: ICharacterTableSkeletonProps): ReactElement {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={rowIndex} data-testid="character-skeleton-row">
          <TableCell>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton width={120} />
            </Stack>
          </TableCell>
          <TableCell>
            <Skeleton width={140} />
          </TableCell>
          {Array.from({ length: abilityCount }, (__, cellIndex) => (
            <TableCell key={cellIndex} align="center">
              <Skeleton width={20} sx={{ mx: 'auto' }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
