import { SquadStats } from '@/entities/squad/index.ts';
import { render, screen, within } from '@testing-library/react';

describe('SquadStats', () => {
  it('shows each ability with its average and the explanation note', () => {
    render(
      <SquadStats
        abilities={[
          { name: 'Power', average: 6.33 },
          { name: 'Mobility', average: null },
        ]}
      />,
    );

    const items = within(screen.getByRole('list', { name: 'Squad averages' })).getAllByRole(
      'listitem',
    );

    expect(items.map((item) => item.textContent)).toEqual(['Power6.33', 'Mobility-']);
    expect(screen.getByText('* Totals as average for squad')).toBeInTheDocument();
  });
});
