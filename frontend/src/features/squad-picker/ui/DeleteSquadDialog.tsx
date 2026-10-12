import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ReactElement } from 'react';

interface IDeleteSquadDialogProps {
  squadName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteSquadDialog({
  squadName,
  isDeleting,
  onConfirm,
  onClose,
}: IDeleteSquadDialogProps): ReactElement {
  return (
    <Dialog open onClose={onClose} maxWidth="xs">
      <DialogTitle>Delete squad?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          &quot;{squadName}&quot; and its characters will be removed. This cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" loading={isDeleting} onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
