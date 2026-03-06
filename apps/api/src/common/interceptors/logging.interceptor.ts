import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { getRequestContext } from "../context/request-context";
import { AppLogger } from "../logger/app-logger.service";

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

    if (Object.keys((body as Record<string, unknown>) || {}).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
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
