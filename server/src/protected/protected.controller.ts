import { Controller, Get, Req } from '@nestjs/common';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('protected')
export class ProtectedController {
  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    return {
      message: 'You made it through the auth middleware',
      user: req.user,
    };
  }
}
