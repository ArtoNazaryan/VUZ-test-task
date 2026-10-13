import { formatDateTime, formatRelativeTime } from '@/shared/lib/helpers/date.helper.ts';

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-13T12:00:00.000Z');

  it('says just now for the last minute', () => {
    expect(formatRelativeTime('2026-10-13T11:59:30.000Z', now)).toBe('just now');
  });

  it('uses minutes, hours and days for the last week', () => {
    expect(formatRelativeTime('2026-10-13T11:58:00.000Z', now)).toBe('2 minutes ago');
    expect(formatRelativeTime('2026-10-13T09:00:00.000Z', now)).toBe('3 hours ago');
    expect(formatRelativeTime('2026-10-12T11:00:00.000Z', now)).toBe('yesterday');
    expect(formatRelativeTime('2026-10-09T12:00:00.000Z', now)).toBe('4 days ago');
  });

  it('shows the date for anything older than a week', () => {
    expect(formatRelativeTime('2026-09-01T12:00:00.000Z', now)).toBe('Sep 1, 2026');
  });
});

describe('formatDateTime', () => {
  it('includes the date and the time', () => {
    expect(formatDateTime('2026-10-13T12:00:00.000Z')).toMatch(/Oct 13, 2026.*\d{1,2}:\d{2}/);
  });
});
