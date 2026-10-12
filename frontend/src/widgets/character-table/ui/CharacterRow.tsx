import {
  AbilityScore,
  CharacterAvatar,
  type ICharacter,
  TagBadge,
} from '@/entities/character/index.ts';
import { SquadMemberCheckbox } from '@/features/toggle-squad-member/index.ts';
import { alpha, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { memo, type ReactElement } from 'react';

interface ICharacterRowProps {
  character: ICharacter;
  isMember: boolean;
  isSquadFull: boolean;
  onToggle: (character: ICharacter, isMember: boolean) => void;
}

function CharacterRowComponent({
  character,
  isMember,
  isSquadFull,
  onToggle,
}: ICharacterRowProps): ReactElement {
  return (
    <TableRow
      hover
      aria-selected={isMember}
      sx={{ bgcolor: (theme) => (isMember ? alpha(theme.palette.primary.main, 0.08) : undefined) }}
    >
      <TableCell padding="checkbox">
        <SquadMemberCheckbox
          characterName={character.name}
          isMember={isMember}
          isSquadFull={isSquadFull}
          onToggle={() => {
            onToggle(character, isMember);
          }}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <CharacterAvatar character={character} />
          <Typography sx={{ fontWeight: 700 }}>{character.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {character.tags.map((tag) => (
            <TagBadge key={tag.name} name={tag.name} />
          ))}
        </Stack>
      </TableCell>
      {character.abilities.map((ability) => (
        <TableCell key={ability.name} align="center">
          <AbilityScore score={ability.score} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export const CharacterRow = memo(CharacterRowComponent);
