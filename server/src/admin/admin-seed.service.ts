import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? 'Algorithm';

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be provided to seed the admin user. Skipping.',
      );
      return;
    }

    const existing = await this.prismaService.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isAdmin) {
        await this.prismaService.prisma.user.update({
          where: { email },
          data: {
            isAdmin: true,
          },
        });
        this.logger.log(`Promoted existing user (${email}) to admin.`);
      } else {
        this.logger.log(`Admin user (${email}) already exists.`);
      }

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prismaService.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        isAdmin: true,
      },
    });

    this.logger.log(`Seeded admin user (${email}).`);
  }
}

