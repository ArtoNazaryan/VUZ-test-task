import { toSocketUrl } from '@/shared/api/index.ts';

describe('toSocketUrl', () => {
  it('keeps only the origin of the API url', () => {
    expect(toSocketUrl('http://localhost:3000/api/v1')).toBe('http://localhost:3000');
    expect(toSocketUrl('https://api.example.com/api/v1/')).toBe('https://api.example.com');
  });
});
