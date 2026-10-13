const SECONDS_PER_UNIT: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];
const MAX_RELATIVE_SECONDS = 7 * 86_400;
const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dateTimeFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });

export function formatRelativeTime(isoDate: string, now: Date): string {
  const date = new Date(isoDate);
  const elapsedSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (elapsedSeconds >= MAX_RELATIVE_SECONDS) {
    return dateFormat.format(date);
  }

  const unit = SECONDS_PER_UNIT.find(([, seconds]) => elapsedSeconds >= seconds);

  return unit
    ? relativeTimeFormat.format(-Math.floor(elapsedSeconds / unit[1]), unit[0])
    : 'just now';
}

export function formatDateTime(isoDate: string): string {
  return dateTimeFormat.format(new Date(isoDate));
}
