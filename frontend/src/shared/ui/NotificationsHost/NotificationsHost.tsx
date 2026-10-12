import { notificationDismissed, selectCurrentNotification } from '@/shared/model/index.ts';
import { Alert, Snackbar } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const AUTO_HIDE_MS = 5000;

export function NotificationsHost(): ReactElement | null {
  const dispatch = useDispatch();
  const notification = useSelector(selectCurrentNotification);

  if (!notification) {
    return null;
  }

  const dismiss = (): void => {
    dispatch(notificationDismissed(notification.id));
  };

  return (
    <Snackbar
      key={notification.id}
      open
      autoHideDuration={AUTO_HIDE_MS}
      onClose={dismiss}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={notification.severity} variant="filled" onClose={dismiss}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
