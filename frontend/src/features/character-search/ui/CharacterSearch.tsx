import { searchChanged, selectCharacterFilters } from '@/entities/character/index.ts';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function CharacterSearch(): ReactElement {
  const dispatch = useDispatch();
  const { search } = useSelector(selectCharacterFilters);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
        },
      }}
    >
      <TextField
        value={search}
        onChange={(event) => dispatch(searchChanged(event.target.value))}
        placeholder="Search Characters..."
        size="small"
        sx={{ width: { xs: '100%', sm: 420 }, bgcolor: 'background.paper', zIndex: 1 }}
        slotProps={{
          htmlInput: { 'aria-label': 'Search characters' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  size="small"
                  edge="end"
                  onClick={() => dispatch(searchChanged(''))}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </Box>
  );
}
