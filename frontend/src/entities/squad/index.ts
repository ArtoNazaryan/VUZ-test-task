export {
  squadApi,
  useCreateSquadMutation,
  useDeleteSquadMutation,
  useGetSquadQuery,
  useGetSquadsQuery,
  useRenameSquadMutation,
} from './api/squad.api.ts';
export { buildActiveSquadStorageKey, resolveActiveSquadId } from './lib/active-squad.helper.ts';
export {
  activeSquadChanged,
  activeSquadSlice,
  selectActiveSquadId,
} from './model/active-squad.slice.ts';
export {
  DEFAULT_SQUAD_NAME,
  MAX_SQUAD_SIZE,
  SQUAD_NAME_MAX_LENGTH,
} from './model/squad.constants.ts';
export type {
  IActiveSquadRootState,
  ICreateSquadRequest,
  IRenameSquadRequest,
  ISquad,
  ISquadAbilityAverage,
  ISquadStats,
  ISquadSummary,
} from './model/squad.interfaces.ts';
