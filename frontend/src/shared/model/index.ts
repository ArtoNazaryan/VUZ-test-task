export type { INotification, INotificationsRootState } from './notifications.interfaces.ts';
export {
  notificationDismissed,
  notificationShown,
  notificationsSlice,
  selectCurrentNotification,
} from './notifications.slice.ts';
export type { TNotificationSeverity } from './notifications.types.ts';
