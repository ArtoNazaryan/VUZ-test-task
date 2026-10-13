import { INVALID_HISTORY_CURSOR_MESSAGE } from '@app/activity/constants/activity.constants.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { HttpStatus } from '@nestjs/common';

export function invalidHistoryCursorError(): AppException {
  return new AppException(
    ErrorCode.ValidationError,
    INVALID_HISTORY_CURSOR_MESSAGE,
    HttpStatus.BAD_REQUEST,
    [{ field: 'cursor', messages: ['cursor is invalid for this request'] }],
  );
}
