import { App } from '@/app/App.tsx';
import { render, screen } from '@testing-library/react';

describe('App', () => {
  it('renders the squad builder on the home route', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Select your squad to defend earthrealm' }),
    ).toBeInTheDocument();
  });
});
