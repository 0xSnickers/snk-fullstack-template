import { Controller, Get } from '@nestjs/common';
import { AppException } from '../common/http/app.exception';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new AppException('NOT_READY', 'Database is not reachable', 503);
    }
  }
}
