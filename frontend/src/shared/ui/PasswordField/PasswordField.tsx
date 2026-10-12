import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { type ReactElement, useState } from 'react';

export function PasswordField(props: TextFieldProps): ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                onClick={() => {
                  setIsVisible((visible) => !visible);
                }}
                edge="end"
              >
                {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
