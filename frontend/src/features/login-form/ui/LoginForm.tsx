import { toLoginErrorTarget } from '@/features/login-form/lib/login-error.helper.ts';
import { loginFormSchema } from '@/features/login-form/model/login-form.schema.ts';
import type { TLoginFormValues } from '@/features/login-form/model/login-form.types.ts';
import { sessionStarted, useLoginMutation } from '@/entities/session/index.ts';
import { toApiError } from '@/shared/api/index.ts';
import { PasswordField } from '@/shared/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { type ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export function LoginForm(): ReactElement {
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<TLoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = async (values: TLoginFormValues): Promise<void> => {
    setFormError(null);

    const result = await login(values);

    if (result.data) {
      dispatch(sessionStarted(result.data));

      return;
    }

    const target = toLoginErrorTarget(toApiError(result.error));

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
            autoComplete="current-password"
            disabled={formState.isSubmitting}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />
      {formError && <Alert severity="error">{formError}</Alert>}
      <Button type="submit" variant="contained" size="large" loading={formState.isSubmitting}>
        Log in
      </Button>
    </Stack>
  );
}
