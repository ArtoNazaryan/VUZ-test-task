import { formatAverage } from '@/entities/squad/index.ts';

describe('formatAverage', () => {
  it('shows a dash for an empty squad', () => {
    expect(formatAverage(null)).toBe('-');
  });

  it('shows whole numbers without decimals', () => {
    expect(formatAverage(7)).toBe('7');
  });

  it('shows up to two decimals like the design', () => {
    expect(formatAverage(6.33)).toBe('6.33');
    expect(formatAverage(6.5)).toBe('6.5');
  });
});
