import { CurrentUser } from '@app/auth/decorators/current-user.decorator.js';
import type { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import { LoginDto } from '@app/auth/dto/login.dto.js';
import { RegisterDto } from '@app/auth/dto/register.dto.js';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import type { IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { AuthService } from '@app/auth/services/auth.service.js';
import { ApiGetProfile, ApiLogin, ApiRegister } from '@app/auth/swagger/auth.swagger.js';
import type { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegister()
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetProfile()
  getProfile(@CurrentUser() user: IAuthUser): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }
}
