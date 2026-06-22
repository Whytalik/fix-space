import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

@Injectable()
export class E2EThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; ip?: string }>();
    if (request.headers["x-e2e-test"] === "true") {
      return true;
    }
    if (process.env.NODE_ENV === "development" && LOOPBACK_ADDRESSES.has(request.ip ?? "")) {
      return true;
    }
    return super.shouldSkip(context);
  }
}
