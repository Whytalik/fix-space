import { Controller, Get, Head } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { prisma } from "@fixspace/database";
import { Public } from "../auth/decorators/public.decorator";

@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @Head()
  @Public()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return { database: { status: "up" } };
        } catch (error: any) {
          return { database: { status: "down", message: error.message } };
        }
      },
    ]);
  }
}
