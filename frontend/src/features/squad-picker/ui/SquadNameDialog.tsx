import { toSquadNameErrorTarget } from '@/features/squad-picker/lib/squad-name-error.helper.ts';
import { squadNameSchema } from '@/features/squad-picker/model/squad-name.schema.ts';
import type {
  TSquadNameValues,
  TSubmitSquadName,
} from '@/features/squad-picker/model/squad-picker.types.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { type ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ISquadNameDialogProps {
  title: string;
  submitLabel: string;
  initialName: string;
  onSubmit: TSubmitSquadName;
  onClose: () => void;
}

export function SquadNameDialog({
  title,
  submitLabel,
  initialName,
  onSubmit,
  onClose,
}: ISquadNameDialogProps): ReactElement {
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<TSquadNameValues>({
    resolver: zodResolver(squadNameSchema),
    defaultValues: { name: initialName },
  });

  const submit = async (values: TSquadNameValues): Promise<void> => {
    setFormError(null);

    const error = await onSubmit(values.name);

    if (!error) {
      onClose();

      return;
    }

    const target = toSquadNameErrorTarget(error);

    if (target.field) {
      setError(target.field, { message: target.message });
    } else {
      setFormError(target.message);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submit)(event);
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Squad name"
                autoFocus
                fullWidth
                margin="dense"
                disabled={formState.isSubmitting}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={formState.isSubmitting}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
