import { AuthController } from '@app/auth/controllers/auth.controller.js';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import { RefreshTokensRepository } from '@app/auth/repositories/refresh-tokens.repository.js';
import { AuthCookieService } from '@app/auth/services/auth-cookie.service.js';
import { AuthService } from '@app/auth/services/auth.service.js';
import { RefreshTokensService } from '@app/auth/services/refresh-tokens.service.js';
import { UsersModule } from '@app/users/users.module.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TEnv, true>): JwtModuleOptions => ({
        secret: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TTL_SECONDS', { infer: true }) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    RefreshTokensService,
    RefreshTokensRepository,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
