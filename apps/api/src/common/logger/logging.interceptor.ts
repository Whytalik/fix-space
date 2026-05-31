import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { getRequestContext } from "../context/request-context";
import { AppLogger } from "./app-logger.service";

const SENSITIVE_KEYS = new Set(["password", "passwordHash", "token", "secret", "refreshToken", "accessToken"]);

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    result[key] = SENSITIVE_KEYS.has(key) ? "[REDACTED]" : value;
  }
  return result;
}

function colorMethod(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case "GET":
      return `\x1b[32m${m}\x1b[0m`;
    case "POST":
      return `\x1b[33m${m}\x1b[0m`;
    case "PUT":
    case "PATCH":
      return `\x1b[34m${m}\x1b[0m`;
    case "DELETE":
      return `\x1b[31m${m}\x1b[0m`;
    default:
      return `\x1b[36m${m}\x1b[0m`;
  }
}

function colorStatus(status: number): string {
  if (status >= 200 && status < 300) {
    return `\x1b[32m${status}\x1b[0m`;
  }
  if (status >= 300 && status < 400) {
    return `\x1b[36m${status}\x1b[0m`;
  }
  if (status >= 400 && status < 500) {
    return `\x1b[33m${status}\x1b[0m`;
  }
  return `\x1b[31m${status}\x1b[0m`;
}

function colorDuration(ms: number): string {
  if (ms < 100) return `\x1b[32m${ms}ms\x1b[0m`;
  if (ms < 500) return `\x1b[33m${ms}ms\x1b[0m`;
  return `\x1b[31m${ms}ms\x1b[0m`;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: AppLogger;

  constructor(logger: AppLogger) {
    this.logger = logger;
    this.logger.setContext("HTTP");
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const reqContext = getRequestContext();

    if (reqContext && request.user) {
      const user = request.user as { userId?: string; username?: string };
      reqContext.userId = user.userId;
      reqContext.username = user.username;
    }

    this.logger.log(`\x1b[32m➜\x1b[0m  [${colorMethod(method)}] ${url}`);

    const bodyObj = (body as Record<string, unknown>) || {};
    if (Object.keys(bodyObj).length > 0) {
      this.logger.debug(`🔍 Body: \x1b[90m${JSON.stringify(sanitizeBody(bodyObj))}\x1b[0m`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - now;
          const status = response.statusCode;
          const icon = status < 400 ? `\x1b[32m✔\x1b[0m` : `\x1b[31m✖\x1b[0m`;
          this.logger.log(
            `${icon}  [${colorMethod(method)}] ${url} ${colorStatus(status)} (${colorDuration(duration)})`,
          );
        },
      }),
    );
  }
}
