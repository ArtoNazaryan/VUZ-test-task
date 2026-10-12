import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { Masthead } from '@/widgets/masthead/index.ts';
import { screen } from '@testing-library/react';

describe('Masthead', () => {
  it('shows only the logo when nobody is logged in', () => {
    renderWithStore(<Masthead />);

    expect(screen.getByRole('img', { name: 'Mortal Kombat' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('shows the user email and a logout button when logged in', () => {
    renderWithStore(<Masthead />, true);

    expect(screen.getByText('ryu@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });
});
