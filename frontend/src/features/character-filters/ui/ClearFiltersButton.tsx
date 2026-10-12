import { filtersCleared } from '@/entities/character/index.ts';
import { Button, type ButtonProps } from '@mui/material';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

export function ClearFiltersButton(props: ButtonProps): ReactElement {
  const dispatch = useDispatch();

  return (
    <Button {...props} onClick={() => dispatch(filtersCleared())}>
      {props.children ?? 'Clear filters'}
    </Button>
  );
}
