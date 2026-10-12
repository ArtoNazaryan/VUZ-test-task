import type { ICharacter } from '@/entities/character/index.ts';
import { useAddSquadMemberMutation } from '@/entities/squad/index.ts';
import { useRemoveSquadMember } from '@/features/toggle-squad-member/model/useRemoveSquadMember.ts';
import { getErrorMessage, toApiError } from '@/shared/api/index.ts';
import { notificationShown } from '@/shared/model/index.ts';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export function useToggleSquadMember(
  squadId: string | null,
): (character: ICharacter, isMember: boolean) => void {
  const dispatch = useDispatch();
  const [addSquadMember] = useAddSquadMemberMutation();
  const removeSquadMember = useRemoveSquadMember();

  return useCallback(
    (character: ICharacter, isMember: boolean): void => {
      if (!squadId) {
        return;
      }

      const toggle = async (): Promise<void> => {
        if (isMember) {
          await removeSquadMember(squadId, character);

          return;
        }

        const result = await addSquadMember({ squadId, characterId: character.id, character });

        if (result.error) {
          dispatch(notificationShown(getErrorMessage(toApiError(result.error))));
        }
      };

      void toggle();
    },
    [squadId, addSquadMember, removeSquadMember, dispatch],
  );
}
