import type { ICharacter } from '@/entities/character/index.ts';
import { useRemoveSquadMemberMutation } from '@/entities/squad/index.ts';
import { getErrorMessage, toApiError } from '@/shared/api/index.ts';
import { notificationShown } from '@/shared/model/index.ts';
import { useDispatch } from 'react-redux';

export function useRemoveSquadMember(): (squadId: string, character: ICharacter) => Promise<void> {
  const dispatch = useDispatch();
  const [removeSquadMember] = useRemoveSquadMemberMutation();

  return async (squadId, character) => {
    const result = await removeSquadMember({ squadId, characterId: character.id });

    if (result.error) {
      dispatch(notificationShown(getErrorMessage(toApiError(result.error))));
    }
  };
}
