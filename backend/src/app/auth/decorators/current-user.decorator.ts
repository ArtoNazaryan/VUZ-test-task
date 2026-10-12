import type { IAuthenticatedRequest, IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): IAuthUser =>
    context.switchToHttp().getRequest<IAuthenticatedRequest>().user,
);
