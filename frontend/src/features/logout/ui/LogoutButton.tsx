import { sessionEnded, useLogoutMutation } from '@/entities/session/index.ts';
import { baseApi } from '@/shared/api/index.ts';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

export function LogoutButton(): ReactElement {
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async (): Promise<void> => {
    await logout(undefined);
    dispatch(sessionEnded());
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <Button
      color="inherit"
      variant="outlined"
      size="small"
      startIcon={<LogoutIcon />}
      loading={isLoading}
      onClick={() => {
        void handleLogout();
      }}
    >
      Log out
    </Button>
  );
}
