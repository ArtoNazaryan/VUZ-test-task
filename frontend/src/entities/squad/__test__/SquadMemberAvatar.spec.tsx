import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { SquadMemberAvatar } from '@/entities/squad/index.ts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SquadMemberAvatar', () => {
  it('removes the character when clicked', async () => {
    const onRemove = vi.fn();
    const character = makeCharacter({ name: 'Scorpion' });
    render(<SquadMemberAvatar character={character} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Scorpion' }));

    expect(onRemove).toHaveBeenCalledWith(character);
  });
});
