import { authenticationRequiredError } from '@app/auth/helpers/auth-errors.helper.js';
import { extractBearerToken, isAccessTokenPayload } from '@app/auth/helpers/token.helper.js';
import type {
  IAccessTokenPayload,
  IAuthenticatedRequest,
} from '@app/auth/interfaces/auth.interfaces.js';
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw authenticationRequiredError();
    }

    const payload = await this.verifyToken(token);

    request.user = { id: payload.sub, email: payload.email };

    return true;
  }

  private async verifyToken(token: string): Promise<IAccessTokenPayload> {
    let payload: unknown;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw authenticationRequiredError();
    }

    if (!isAccessTokenPayload(payload)) {
      throw authenticationRequiredError();
    }

    return payload;
  }
}
