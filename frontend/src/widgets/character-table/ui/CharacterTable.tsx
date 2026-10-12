import {
  type ICharacterListArgs,
  useGetCharacterFiltersQuery,
  useGetCharactersInfiniteQuery,
} from '@/entities/character/index.ts';
import { toApiError, getErrorMessage } from '@/shared/api/index.ts';
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
import { type ReactElement, type ReactNode, useCallback, useRef } from 'react';

const SKELETON_ROWS = 6;
const DEFAULT_ABILITY_COUNT = 5;

interface ICharacterTableProps {
  filters: ICharacterListArgs;
  emptyAction?: ReactNode;
}

export function CharacterTable({ filters, emptyAction }: ICharacterTableProps): ReactElement {
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
  } = useGetCharactersInfiniteQuery(filters);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const characters = data?.pages.flatMap((page) => page.items) ?? [];
  const abilityNames = filterOptions?.abilities ?? [];
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isError;

  const loadMore = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  useOnVisible(sentinelRef, loadMore, canLoadMore);

  if (isError && characters.length === 0) {
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

  if (!isLoading && characters.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider' }}>
        <Typography sx={{ mb: 2 }}>No champions match your filters</Typography>
        {emptyAction}
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <Table aria-label="Characters" sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
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
          {isLoading ? (
            <CharacterTableSkeleton
              rows={SKELETON_ROWS}
              abilityCount={abilityNames.length || DEFAULT_ABILITY_COUNT}
            />
          ) : (
            characters.map((character) => <CharacterRow key={character.id} character={character} />)
          )}
        </TableBody>
      </Table>
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
    </TableContainer>
  );
}
