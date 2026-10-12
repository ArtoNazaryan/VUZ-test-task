import { getInitials } from '@/entities/character/lib/character-display.helper.ts';
import type { ICharacterPortrait } from '@/entities/character/model/character.interfaces.ts';
import { Avatar } from '@mui/material';
import type { ReactElement } from 'react';

interface ICharacterAvatarProps {
  character: ICharacterPortrait;
  size?: number;
}

export function CharacterAvatar({ character, size = 40 }: ICharacterAvatarProps): ReactElement {
  return (
    <Avatar
      src={character.thumbnail ?? character.image}
      alt={character.name}
      slotProps={{ img: { loading: 'lazy' } }}
      sx={{
        width: size,
        height: size,
        bgcolor: 'grey.300',
        color: 'text.primary',
        fontSize: size / 2.5,
      }}
    >
      {getInitials(character.name)}
    </Avatar>
  );
}
