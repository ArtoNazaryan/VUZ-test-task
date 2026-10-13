import { useGetSquadHistoryInfiniteQuery } from '@/entities/squad/index.ts';
import { SquadActivityItem } from '@/features/squad-history/ui/SquadActivityItem.tsx';
import { getErrorMessage, toApiError } from '@/shared/api/index.ts';
import { useOnVisible } from '@/shared/lib/hooks/useOnVisible.ts';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactElement, useCallback, useRef } from 'react';

const SKELETON_ITEMS = 5;

interface ISquadHistoryPanelProps {
  squadId: string;
  onClose: () => void;
}

export function SquadHistoryPanel({ squadId, onClose }: ISquadHistoryPanelProps): ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetSquadHistoryInfiniteQuery(squadId, { refetchOnMountOrArgChange: true });
  const activities = data?.pages.flatMap((page) => page.items) ?? [];
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isError;
  const now = new Date();

  const loadMore = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  useOnVisible(sentinelRef, loadMore, canLoadMore);

  return (
    <Box sx={{ width: { xs: '100vw', sm: 380 }, p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="h2">
          Squad history
        </Typography>
        <IconButton aria-label="Close squad history" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      {isLoading &&
        Array.from({ length: SKELETON_ITEMS }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={48} sx={{ my: 1 }} />
        ))}
      {isError && activities.length === 0 && (
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
      )}
      {!isLoading && !isError && activities.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No changes recorded yet
        </Typography>
      )}
      {activities.length > 0 && (
        <List aria-label="Squad history">
          {activities.map((activity) => (
            <SquadActivityItem key={activity.id} activity={activity} now={now} />
          ))}
        </List>
      )}
      <Box ref={sentinelRef} sx={{ textAlign: 'center' }}>
        {isFetchingNextPage && <CircularProgress size={24} aria-label="Loading more history" />}
        {canLoadMore && (
          <Button size="small" onClick={loadMore}>
            Load more
          </Button>
        )}
        {isError && activities.length > 0 && (
          <Button size="small" color="error" onClick={loadMore}>
            Could not load more, try again
          </Button>
        )}
      </Box>
    </Box>
  );
}
