import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) {
      return false;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = req.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Admin access required');
    }

    const user = await this.prismaService.prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
