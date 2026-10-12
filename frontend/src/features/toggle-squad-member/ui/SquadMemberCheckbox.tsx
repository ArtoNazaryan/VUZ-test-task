import { Checkbox, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

interface ISquadMemberCheckboxProps {
  characterName: string;
  isMember: boolean;
  isSquadFull: boolean;
  onToggle: () => void;
}

export function SquadMemberCheckbox({
  characterName,
  isMember,
  isSquadFull,
  onToggle,
}: ISquadMemberCheckboxProps): ReactElement {
  const isDisabled = isSquadFull && !isMember;
  const checkbox = (
    <Checkbox
      checked={isMember}
      disabled={isDisabled}
      onChange={onToggle}
      slotProps={{
        input: {
          'aria-label': isMember
            ? `Remove ${characterName} from squad`
            : `Add ${characterName} to squad`,
        },
      }}
    />
  );

  return isDisabled ? (
    <Tooltip title="Your squad already has 6 characters">
      <span>{checkbox}</span>
    </Tooltip>
  ) : (
    checkbox
  );
}
