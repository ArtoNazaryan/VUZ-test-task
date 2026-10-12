import { App } from '@/app/App.tsx';
import { render, screen } from '@testing-library/react';

describe('App', () => {
  it('renders the application title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Squad of Champions' })).toBeInTheDocument();
  });
});
