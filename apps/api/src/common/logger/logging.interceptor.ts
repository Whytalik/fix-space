import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { getRequestContext } from "../context/request-context";
import { AppLogger } from "./app-logger.service";

const SENSITIVE_KEYS = new Set(["password", "passwordHash", "token", "secret", "refreshToken", "accessToken"]);

function sanitizeBody(body: unknown): unknown {
  if (Array.isArray(body)) return body.map(sanitizeBody);
  if (body !== null && typeof body === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.has(key) ? "[REDACTED]" : sanitizeBody(value);
    }
    return result;
  }
  return body;
}

function colorMethod(method: string): string {
  const uppercaseMethod = method.toUpperCase();
  switch (uppercaseMethod) {
    case "GET":
      return `\x1b[32m${uppercaseMethod}\x1b[0m`;
    case "POST":
      return `\x1b[33m${uppercaseMethod}\x1b[0m`;
    case "PUT":
    case "PATCH":
      return `\x1b[34m${uppercaseMethod}\x1b[0m`;
    case "DELETE":
      return `\x1b[31m${uppercaseMethod}\x1b[0m`;
    default:
      return `\x1b[36m${uppercaseMethod}\x1b[0m`;
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
    const requestContext = getRequestContext();

    if (requestContext && request.user) {
      const user = request.user as { userId?: string; username?: string };
      requestContext.userId = user.userId;
      requestContext.username = user.username;
    }

    this.logger.log(`\x1b[32m➜\x1b[0m  [${colorMethod(method)}] ${url}`);

    const parsedBody = (body as Record<string, unknown>) ?? {};
    if (Object.keys(parsedBody).length > 0) {
      try {
        this.logger.debug(`🔍 Body: \x1b[90m${JSON.stringify(sanitizeBody(parsedBody))}\x1b[0m`);
      } catch {
        this.logger.debug("🔍 Body: [unserializable]");
      }
    }

    const startTime = requestContext?.startTime ?? Date.now();

    const logCompletion = (status: number) => {
      const duration = Date.now() - startTime;
      const icon = status < 400 ? `\x1b[32m✔\x1b[0m` : `\x1b[31m✖\x1b[0m`;
      this.logger.log(`${icon}  [${colorMethod(method)}] ${url} ${colorStatus(status)} (${colorDuration(duration)})`);
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          logCompletion(response.statusCode);
        },
        error: () => {
          logCompletion(500);
        },
      }),
    );
  }
}
