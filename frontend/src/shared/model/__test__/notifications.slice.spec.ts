import {
  notificationDismissed,
  notificationShown,
  notificationsSlice,
} from '@/shared/model/index.ts';

const reducer = notificationsSlice.reducer;

describe('notificationsSlice', () => {
  it('shows an error notification by default', () => {
    const state = reducer(undefined, notificationShown('Squad is full'));

    expect(state.current).toMatchObject({ message: 'Squad is full', severity: 'error' });
  });

  it('replaces the current notification with a newer one', () => {
    const state = reducer(
      reducer(undefined, notificationShown('first')),
      notificationShown('second', 'info'),
    );

    expect(state.current).toMatchObject({ message: 'second', severity: 'info' });
  });

  it('ignores a dismissal of a notification that was already replaced', () => {
    const first = reducer(undefined, notificationShown('first'));
    const firstId = first.current?.id ?? 0;
    const second = reducer(first, notificationShown('second'));

    expect(reducer(second, notificationDismissed(firstId)).current?.message).toBe('second');
  });
});
