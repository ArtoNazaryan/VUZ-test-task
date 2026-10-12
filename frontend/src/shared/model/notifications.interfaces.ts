import type { TNotificationSeverity } from '@/shared/model/notifications.types.ts';

export interface INotification {
  id: number;
  message: string;
  severity: TNotificationSeverity;
}

export interface INotificationsState {
  current: INotification | null;
}

export interface INotificationsRootState {
  notifications: INotificationsState;
}
