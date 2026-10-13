import { SquadHistoryPanel } from '@/features/squad-history/ui/SquadHistoryPanel.tsx';
import HistoryIcon from '@mui/icons-material/History';
import { Drawer, IconButton, Tooltip } from '@mui/material';
import { type ReactElement, useState } from 'react';

interface ISquadHistoryButtonProps {
  squadId: string;
}

export function SquadHistoryButton({ squadId }: ISquadHistoryButtonProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const close = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip title="Squad history">
        <IconButton
          aria-label="Show squad history"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <HistoryIcon />
        </IconButton>
      </Tooltip>
      <Drawer anchor="right" open={isOpen} onClose={close}>
        {isOpen && <SquadHistoryPanel squadId={squadId} onClose={close} />}
      </Drawer>
    </>
  );
}
