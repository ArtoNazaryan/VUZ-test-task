import { toRegisterErrorTarget } from '@/features/register-form/lib/register-error.helper.ts';
import {
  PASSWORD_MIN_LENGTH,
  registerFormSchema,
} from '@/features/register-form/model/register-form.schema.ts';
import type { TRegisterFormValues } from '@/features/register-form/model/register-form.types.ts';
import { sessionStarted, useRegisterMutation } from '@/entities/session/index.ts';
import { toApiError } from '@/shared/api/index.ts';
import { PasswordField } from '@/shared/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { type ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export function RegisterForm(): ReactElement {
  const dispatch = useDispatch();
  const [register] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<TRegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = async (values: TRegisterFormValues): Promise<void> => {
    setFormError(null);

    const result = await register(values);

    if (result.data) {
      dispatch(sessionStarted(result.data));

      return;
    }

    const target = toRegisterErrorTarget(toApiError(result.error));

    if (target.field) {
      setError(target.field, { message: target.message });
    } else {
      setFormError(target.message);
    }
  };

  return (
    <Stack
      component="form"
      noValidate
      spacing={2}
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            autoComplete="email"
            disabled={formState.isSubmitting}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <PasswordField
            {...field}
            label="Password"
            autoComplete="new-password"
            disabled={formState.isSubmitting}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? `At least ${PASSWORD_MIN_LENGTH} characters`}
            fullWidth
          />
        )}
      />
      {formError && <Alert severity="error">{formError}</Alert>}
      <Button type="submit" variant="contained" size="large" loading={formState.isSubmitting}>
        Create account
      </Button>
    </Stack>
  );
}
