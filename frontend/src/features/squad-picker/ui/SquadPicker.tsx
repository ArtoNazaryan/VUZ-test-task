import {
  activeSquadChanged,
  MAX_SQUAD_SIZE,
  useCreateSquadMutation,
  useDeleteSquadMutation,
  useRenameSquadMutation,
} from '@/entities/squad/index.ts';
import type { ISquadPickerProps } from '@/features/squad-picker/model/squad-picker.interfaces.ts';
import type { TOpenDialog } from '@/features/squad-picker/model/squad-picker.types.ts';
import { useActiveSquadBootstrap } from '@/features/squad-picker/model/useActiveSquadBootstrap.ts';
import { DeleteSquadDialog } from '@/features/squad-picker/ui/DeleteSquadDialog.tsx';
import { SquadNameDialog } from '@/features/squad-picker/ui/SquadNameDialog.tsx';
import { type IApiError, toApiError } from '@/shared/api/index.ts';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { type ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';

export function SquadPicker({ actions }: ISquadPickerProps): ReactElement {
  const dispatch = useDispatch();
  const { squads, activeSquadId, isLoading, isError, retry } = useActiveSquadBootstrap();
  const [createSquad] = useCreateSquadMutation();
  const [renameSquad] = useRenameSquadMutation();
  const [deleteSquad, { isLoading: isDeleting }] = useDeleteSquadMutation();
  const [openDialog, setOpenDialog] = useState<TOpenDialog>(null);
  const activeSquad = squads.find((squad) => squad.id === activeSquadId);
  const closeDialog = (): void => {
    setOpenDialog(null);
  };

  const handleCreate = async (name: string): Promise<IApiError | null> => {
    const result = await createSquad({ name });

    if (result.data) {
      dispatch(activeSquadChanged(result.data.id));

      return null;
    }

    return toApiError(result.error);
  };

  const handleRename = async (name: string): Promise<IApiError | null> => {
    if (!activeSquad) {
      return null;
    }

    const result = await renameSquad({ id: activeSquad.id, name });

    return result.error ? toApiError(result.error) : null;
  };

  const handleDelete = async (): Promise<void> => {
    if (activeSquad) {
      await deleteSquad(activeSquad.id);
    }

    closeDialog();
  };

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={retry}>
            Try again
          </Button>
        }
      >
        Your squads could not be loaded
      </Alert>
    );
  }

  if (isLoading || !activeSquad) {
    return <Skeleton variant="rounded" width={320} height={40} sx={{ mx: 'auto' }} />;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <TextField
        select
        size="small"
        label="Squad"
        value={activeSquad.id}
        onChange={(event) => dispatch(activeSquadChanged(event.target.value))}
        sx={{ minWidth: 220, bgcolor: 'background.paper' }}
      >
        {squads.map((squad) => (
          <MenuItem key={squad.id} value={squad.id}>
            {squad.name} ({squad.memberCount}/{MAX_SQUAD_SIZE})
          </MenuItem>
        ))}
      </TextField>
      <Tooltip title="Rename squad">
        <IconButton
          aria-label="Rename squad"
          onClick={() => {
            setOpenDialog('rename');
          }}
        >
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete squad">
        <IconButton
          aria-label="Delete squad"
          onClick={() => {
            setOpenDialog('delete');
          }}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Tooltip>
      {actions}
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          setOpenDialog('create');
        }}
      >
        New squad
      </Button>
      {openDialog === 'create' && (
        <SquadNameDialog
          title="New squad"
          submitLabel="Create"
          initialName=""
          onSubmit={handleCreate}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'rename' && (
        <SquadNameDialog
          title="Rename squad"
          submitLabel="Save"
          initialName={activeSquad.name}
          onSubmit={handleRename}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'delete' && (
        <DeleteSquadDialog
          squadName={activeSquad.name}
          isDeleting={isDeleting}
          onConfirm={() => {
            void handleDelete();
          }}
          onClose={closeDialog}
        />
      )}
    </Stack>
  );
}
