import { capitalize } from '@/shared/lib/helpers/text.helper.ts';
import { Chip } from '@mui/material';
import type { ReactElement } from 'react';

interface ITagBadgeProps {
  name: string;
}

export function TagBadge({ name }: ITagBadgeProps): ReactElement {
  return <Chip label={capitalize(name)} size="small" variant="outlined" color="primary" />;
}
