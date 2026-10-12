import { CurrentUser } from '@app/auth/decorators/current-user.decorator.js';
import type { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import { LoginDto } from '@app/auth/dto/login.dto.js';
import { RegisterDto } from '@app/auth/dto/register.dto.js';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import { readRefreshTokenCookie } from '@app/auth/helpers/refresh-cookie.helper.js';
import type { IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { AuthCookieService } from '@app/auth/services/auth-cookie.service.js';
import { AuthService } from '@app/auth/services/auth.service.js';
import {
  ApiAuthController,
  ApiGetProfile,
  ApiLogin,
  ApiLogout,
  ApiRefresh,
  ApiRegister,
} from '@app/auth/swagger/auth.swagger.js';
import { StrictRateLimit } from '@infrastructure/rate-limit/decorators/strict-rate-limit.decorator.js';
import type { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@ApiAuthController()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @StrictRateLimit()
  @ApiRegister()
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.register(dto);

    this.authCookieService.setRefreshToken(response, session.refreshToken);

    return session.response;
  }

  @Post('login')
  @StrictRateLimit()
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.login(dto);

    this.authCookieService.setRefreshToken(response, session.refreshToken);

    return session.response;
  }

  @Post('refresh')
  @StrictRateLimit()
  @HttpCode(HttpStatus.OK)
  @ApiRefresh()
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.refresh(readRefreshTokenCookie(request));

    this.authCookieService.setRefreshToken(response, session.refreshToken);

    return session.response;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogout()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(readRefreshTokenCookie(request));
    this.authCookieService.clearRefreshToken(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetProfile()
  getProfile(@CurrentUser() user: IAuthUser): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }
}
