import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getRequestContext } from '../context/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const reqContext = getRequestContext();

    // Enrich context with userId from JWT (populated by JwtAuthGuard before interceptor)
    if (reqContext && request.user) {
      reqContext.userId = request.user.userId;
      reqContext.username = request.user.username;
    }

    const requestId = reqContext?.requestId?.substring(0, 8) || 'no-id';
    const userId = reqContext?.userId || 'anonymous';

    this.logger.log(
      `>>> ${method} ${url} | reqId=${requestId}, userId=${userId}`,
    );

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)} | reqId=${requestId}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(
            `<<< ${method} ${url} ${response.statusCode} ${duration}ms | reqId=${requestId}, userId=${userId}`,
          );
        },
        // Error logging handled by GlobalExceptionFilter — no duplicate logging here
      }),
    );
  }
}
