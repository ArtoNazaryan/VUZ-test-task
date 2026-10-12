import type {
  INotification,
  INotificationsRootState,
  INotificationsState,
} from '@/shared/model/notifications.interfaces.ts';
import type { TNotificationSeverity } from '@/shared/model/notifications.types.ts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: INotificationsState = { current: null };
let nextNotificationId = 1;

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationShown: {
      reducer: (state, action: PayloadAction<INotification>) => {
        state.current = action.payload;
      },
      prepare: (message: string, severity: TNotificationSeverity = 'error') => ({
        payload: { id: nextNotificationId++, message, severity },
      }),
    },
    notificationDismissed: (state, action: PayloadAction<number>) => {
      if (state.current?.id === action.payload) {
        state.current = null;
      }
    },
  },
});

export const { notificationShown, notificationDismissed } = notificationsSlice.actions;

export const selectCurrentNotification = (state: INotificationsRootState): INotification | null =>
  state.notifications.current;
