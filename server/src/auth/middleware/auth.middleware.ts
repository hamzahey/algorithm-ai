import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const headerToken = header?.startsWith('Bearer ')
      ? header.split(' ')[1]
      : undefined;
    const cookieToken = req.cookies?.auth_token as string | undefined;
    const token = headerToken ?? cookieToken;

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = { userId: payload.sub, email: payload.email };
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
