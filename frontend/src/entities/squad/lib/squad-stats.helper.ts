const EMPTY_AVERAGE = '-';

export function formatAverage(average: number | null): string {
  if (average === null) {
    return EMPTY_AVERAGE;
  }

  return Number.isInteger(average) ? String(average) : average.toFixed(2).replace(/0$/, '');
}
