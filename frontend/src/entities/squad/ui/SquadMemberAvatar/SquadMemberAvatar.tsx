import type { ICharacter } from '@/entities/character/@x/squad.ts';
import { Avatar, Box, ButtonBase, Typography } from '@mui/material';
import type { ReactElement } from 'react';

const AVATAR_SIZE = 56;

interface ISquadMemberAvatarProps {
  character: ICharacter;
  onRemove: (character: ICharacter) => void;
}

export function SquadMemberAvatar({ character, onRemove }: ISquadMemberAvatarProps): ReactElement {
  return (
    <ButtonBase
      aria-label={`Remove ${character.name}`}
      onClick={() => {
        onRemove(character);
      }}
      sx={{
        position: 'relative',
        borderRadius: '50%',
        '&:hover .remove-overlay, &.Mui-focusVisible .remove-overlay': { opacity: 1 },
      }}
    >
      <Avatar
        src={character.thumbnail ?? character.image}
        alt={character.name}
        sx={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          border: 3,
          borderColor: 'primary.main',
          bgcolor: 'grey.300',
        }}
      />
      <Box
        className="remove-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          bgcolor: 'rgba(47, 128, 237, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 120ms ease-in-out',
        }}
      >
        <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 700 }}>
          Remove
        </Typography>
      </Box>
    </ButtonBase>
  );
}
