import { AUTHENTICATION_REQUIRED_MESSAGE } from '@app/auth/constants/auth.constants.js';
import { extractBearerToken, isAccessTokenPayload } from '@app/auth/helpers/token.helper.js';
import type {
  IAccessTokenPayload,
  IAuthenticatedRequest,
} from '@app/auth/interfaces/auth.interfaces.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { type CanActivate, type ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw this.unauthorized();
    }

    const payload = await this.verifyToken(token);

    request.user = { id: payload.sub, email: payload.email };

    return true;
  }

  private async verifyToken(token: string): Promise<IAccessTokenPayload> {
    const payload: unknown = await this.jwtService.verifyAsync(token).catch(() => null);

    if (!isAccessTokenPayload(payload)) {
      throw this.unauthorized();
    }

    return payload;
  }

  private unauthorized(): AppException {
    return new AppException(
      ErrorCode.Unauthorized,
      AUTHENTICATION_REQUIRED_MESSAGE,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
