import {
  AUTHENTICATION_REQUIRED_MESSAGE,
  DUMMY_PASSWORD_HASH,
  INVALID_CREDENTIALS_MESSAGE,
} from '@app/auth/constants/auth.constants.js';
import type { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import type { LoginDto } from '@app/auth/dto/login.dto.js';
import type { RegisterDto } from '@app/auth/dto/register.dto.js';
import { hashPassword, verifyPassword } from '@app/auth/helpers/password.helper.js';
import type { IAccessTokenPayload } from '@app/auth/interfaces/auth.interfaces.js';
import type { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import { toUserResponse } from '@app/users/mappers/user.mapper.js';
import { UsersService } from '@app/users/services/users.service.js';
import type { TUserRow } from '@app/users/types/user.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TEnv, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(dto.email, await hashPassword(dto.password));

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = await verifyPassword(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      dto.password,
    );

    if (!user || !passwordMatches) {
      throw new AppException(
        ErrorCode.InvalidCredentials,
        INVALID_CREDENTIALS_MESSAGE,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new AppException(
        ErrorCode.Unauthorized,
        AUTHENTICATION_REQUIRED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return toUserResponse(user);
  }

  private async buildAuthResponse(user: TUserRow): Promise<AuthResponseDto> {
    const payload: IAccessTokenPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_ACCESS_TTL_SECONDS', { infer: true }),
      user: toUserResponse(user),
    };
  }
}
