import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { getRequestContext } from "../context/request-context";
import { AppLogger } from "../logger/app-logger.service";

const SENSITIVE_KEYS = new Set(["password", "passwordHash", "token", "secret", "refreshToken", "accessToken"]);

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    result[key] = SENSITIVE_KEYS.has(key) ? "[REDACTED]" : value;
  }
  return result;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: AppLogger;

  constructor(logger: AppLogger) {
    this.logger = logger;
    this.logger.setContext("HTTP");
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const reqContext = getRequestContext();

    if (reqContext && request.user) {
      reqContext.userId = request.user.userId;
      reqContext.username = request.user.username;
    }

    this.logger.log(`>>> ${method} ${url}`);

    const bodyObj = (body as Record<string, unknown>) || {};
    if (Object.keys(bodyObj).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(sanitizeBody(bodyObj))}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(`<<< ${method} ${url} ${response.statusCode} ${duration}ms`);
        },
      }),
    );
  }
}
