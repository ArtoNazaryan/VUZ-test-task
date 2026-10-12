import {
  filterCharactersLocally,
  type ICharacterListArgs,
  useGetCharacterFiltersQuery,
  useGetCharactersInfiniteQuery,
} from '@/entities/character/index.ts';
import { MAX_SQUAD_SIZE, selectActiveSquadId, useGetSquadQuery } from '@/entities/squad/index.ts';
import { useToggleSquadMember } from '@/features/toggle-squad-member/index.ts';
import { getErrorMessage, toApiError } from '@/shared/api/index.ts';
import { useOnVisible } from '@/shared/lib/hooks/useOnVisible.ts';
import { CharacterRow } from '@/widgets/character-table/ui/CharacterRow.tsx';
import { CharacterTableSkeleton } from '@/widgets/character-table/ui/CharacterTableSkeleton.tsx';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { type ReactElement, type ReactNode, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

const SKELETON_ROWS = 6;
const DEFAULT_ABILITY_COUNT = 5;

interface ICharacterTableProps {
  filters: ICharacterListArgs;
  myTeamOnly?: boolean;
  emptyAction?: ReactNode;
}

export function CharacterTable({
  filters,
  myTeamOnly = false,
  emptyAction,
}: ICharacterTableProps): ReactElement {
  const activeSquadId = useSelector(selectActiveSquadId);
  const { data: squad } = useGetSquadQuery(activeSquadId ?? skipToken);
  const { data: filterOptions } = useGetCharacterFiltersQuery(undefined);
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetCharactersInfiniteQuery(myTeamOnly ? skipToken : filters);
  const toggleSquadMember = useToggleSquadMember(activeSquadId);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const squadCharacters = useMemo(() => squad?.characters ?? [], [squad]);
  const memberIds = useMemo(
    () => new Set(squadCharacters.map((character) => character.id)),
    [squadCharacters],
  );
  const characters = myTeamOnly
    ? filterCharactersLocally(squadCharacters, filters)
    : (data?.pages.flatMap((page) => page.items) ?? []);
  const isSquadFull = memberIds.size >= MAX_SQUAD_SIZE;
  const abilityNames = filterOptions?.abilities ?? [];
  const isListLoading = !myTeamOnly && isLoading;
  const canLoadMore = !myTeamOnly && hasNextPage && !isFetchingNextPage && !isError;

  const loadMore = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  useOnVisible(sentinelRef, loadMore, canLoadMore);

  if (!myTeamOnly && isError && characters.length === 0) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Try again
          </Button>
        }
      >
        {getErrorMessage(toApiError(error))}
      </Alert>
    );
  }

  if (!isListLoading && characters.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider' }}>
        <Typography sx={{ mb: 2 }}>
          {myTeamOnly && squadCharacters.length === 0
            ? 'Your squad is empty, tick characters in the list to add them'
            : 'No champions match your filters'}
        </Typography>
        {emptyAction}
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <Table aria-label="Characters" sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                }}
              >
                In squad
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Character</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tags</TableCell>
            {abilityNames.map((name) => (
              <TableCell key={name} align="center" sx={{ fontWeight: 700 }}>
                {name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isListLoading ? (
            <CharacterTableSkeleton
              rows={SKELETON_ROWS}
              abilityCount={abilityNames.length || DEFAULT_ABILITY_COUNT}
            />
          ) : (
            characters.map((character) => (
              <CharacterRow
                key={character.id}
                character={character}
                isMember={memberIds.has(character.id)}
                isSquadFull={isSquadFull}
                onToggle={toggleSquadMember}
              />
            ))
          )}
        </TableBody>
      </Table>
      {!myTeamOnly && (
        <Box ref={sentinelRef} sx={{ py: 2, textAlign: 'center' }}>
          {isFetchingNextPage && <CircularProgress size={24} aria-label="Loading more champions" />}
          {canLoadMore && (
            <Button size="small" onClick={loadMore}>
              Load more
            </Button>
          )}
          {isError && characters.length > 0 && (
            <Button size="small" color="error" onClick={loadMore}>
              Could not load more, try again
            </Button>
          )}
          {!hasNextPage && !isLoading && (
            <Typography variant="body2" color="text.secondary">
              That&apos;s everyone
            </Typography>
          )}
        </Box>
      )}
    </TableContainer>
  );
}
