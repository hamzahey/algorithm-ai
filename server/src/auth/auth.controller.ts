import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  private readonly cookieName = 'auth_token';

  private readonly cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
  };

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response = await this.authService.register(dto);
    this.attachTokenCookie(res, response.accessToken);
    return response;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response = await this.authService.login(dto);
    this.attachTokenCookie(res, response.accessToken);
    return response;
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  signout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.clearTokenCookie(res);
    return {
      message: `Signed out ${req.user?.email ?? 'user'}`,
    };
  }

  private attachTokenCookie(res: Response, token: string) {
    res.cookie(this.cookieName, token, this.cookieOptions);
  }

  private clearTokenCookie(res: Response) {
    res.clearCookie(this.cookieName, this.cookieOptions);
  }
}
