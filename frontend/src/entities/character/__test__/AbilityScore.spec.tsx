import { AbilityScore } from '@/entities/character/index.ts';
import { render, screen } from '@testing-library/react';

describe('AbilityScore', () => {
  it('highlights the maximum score of 10', () => {
    render(<AbilityScore score={10} />);

    expect(screen.getByText('10')).toHaveAttribute('data-max', 'true');
  });

  it('does not highlight other scores', () => {
    render(<AbilityScore score={7} />);

    expect(screen.getByText('7')).not.toHaveAttribute('data-max');
  });
});
