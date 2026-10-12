import CheckIcon from '@mui/icons-material/Check';
import { Chip } from '@mui/material';
import type { ReactElement } from 'react';

interface IFilterPillProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function FilterPill({ label, isSelected, onToggle }: IFilterPillProps): ReactElement {
  return (
    <Chip
      label={label}
      color="primary"
      variant={isSelected ? 'filled' : 'outlined'}
      icon={isSelected ? <CheckIcon /> : undefined}
      onClick={onToggle}
      aria-pressed={isSelected}
      sx={{ bgcolor: isSelected ? undefined : 'background.paper' }}
    />
  );
}
