import { Controller, Get, Head } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { prisma } from "@fixspace/database";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @Head()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: "Check API health status" })
  @ApiResponse({ status: 200, description: "API is healthy." })
  @ApiResponse({ status: 503, description: "Service unavailable (database down)." })
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
