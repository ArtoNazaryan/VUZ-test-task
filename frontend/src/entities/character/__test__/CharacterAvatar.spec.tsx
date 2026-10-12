import { CharacterAvatar } from '@/entities/character/index.ts';
import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { render, screen } from '@testing-library/react';

describe('CharacterAvatar', () => {
  it('shows the thumbnail with the character name as alt text', () => {
    render(<CharacterAvatar character={makeCharacter()} />);

    expect(screen.getByRole('img', { name: 'Cassie Cage' })).toHaveAttribute(
      'src',
      'https://cdn.test/cassie-thumb.png',
    );
  });

  it('falls back to the full image when there is no thumbnail', () => {
    render(<CharacterAvatar character={makeCharacter({ thumbnail: null })} />);

    expect(screen.getByRole('img', { name: 'Cassie Cage' })).toHaveAttribute(
      'src',
      'https://cdn.test/cassie.png',
    );
  });
});
