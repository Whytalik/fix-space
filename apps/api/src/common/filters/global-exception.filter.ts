import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { Prisma } from "@fixspace/database";
import { I18nValidationException } from "nestjs-i18n";

import { getRequestContext } from "../context/request-context";
import { AppLogger } from "../logger/app-logger.service";
import { t } from "../utils/i18n.helper";

const PRISMA_ERROR_MAP: Record<string, { status: number; i18nKey: string }> = {
  P2000: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.INPUT_TOO_LONG" },
  P2002: { status: HttpStatus.CONFLICT, i18nKey: "errors.RESOURCE_EXISTS" },
  P2003: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.RESOURCE_NOT_FOUND" },
  P2005: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.INVALID_VALUE" },
  P2006: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.INVALID_INPUT" },
  P2009: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.QUERY_VALIDATION_FAILED" },
  P2025: { status: HttpStatus.NOT_FOUND, i18nKey: "errors.NOT_FOUND" },
  P2026: { status: HttpStatus.BAD_REQUEST, i18nKey: "errors.QUERY_LIMIT_EXCEEDED" },
};

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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: AppLogger;

  constructor(logger: AppLogger) {
    this.logger = logger;
    this.logger.setContext("ExceptionFilter");
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== "http") return;

    const httpCtx = host.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();
    const requestContext = getRequestContext();

    const { method, url } = request;

    let status: number;
    let message: string | string[];
    let errorType: string;

    if (exception instanceof I18nValidationException) {
      status = exception.getStatus();
      const rawMessages: string[] = [];
      for (const err of exception.errors) {
        if (err.constraints) {
          for (const val of Object.values(err.constraints)) {
            rawMessages.push(t(val));
          }
        }
      }
      message = rawMessages;
      errorType = "VALIDATION";

      this.logger.log(
        `\x1b[33m✖\x1b[0m  [\x1b[33m${errorType}\x1b[0m] ${colorStatus(status)} | [${colorMethod(method)}] ${url} | ${JSON.stringify(exception.errors)}`,
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>).message as string | string[]);
      errorType = "HTTP";

      if (status >= 500) {
        this.logger.error(
          `\x1b[31m✖\x1b[0m  [\x1b[31m${errorType}\x1b[0m] ${colorStatus(status)} | [${colorMethod(method)}] ${url} | ${message}`,
          {
            stack: exception.stack,
          },
        );
      } else if (status === 401 || status === 403) {
        this.logger.warn(
          `\x1b[33m✖\x1b[0m  [\x1b[33m${errorType}\x1b[0m] ${colorStatus(status)} | [${colorMethod(method)}] ${url} | ${message}`,
        );
      } else {
        this.logger.log(
          `\x1b[33m✖\x1b[0m  [\x1b[33m${errorType}\x1b[0m] ${colorStatus(status)} | [${colorMethod(method)}] ${url} | ${message}`,
        );
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaCode = exception.code;
      const mapped = PRISMA_ERROR_MAP[prismaCode];
      errorType = "DATABASE";

      if (mapped) {
        status = mapped.status;
        message = t(mapped.i18nKey);
        this.logger.warn(`\x1b[33m✖\x1b[0m  [\x1b[31m${errorType}\x1b[0m] ${prismaCode} | [${colorMethod(method)}] ${url} | ${message}`);
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = t("errors.INTERNAL_ERROR");
        this.logger.error(
          `\x1b[31m✖\x1b[0m  [\x1b[31m${errorType}\x1b[0m] ${prismaCode} | [${colorMethod(method)}] ${url} | Unhandled database error`,
          {
            stack: exception.stack,
            meta: exception.meta,
          },
        );
      }
    } else if (
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientInitializationError
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = t("errors.INTERNAL_ERROR");
      errorType = "DATABASE";

      this.logger.error(
        `\x1b[31m✖\x1b[0m  [\x1b[31m${errorType}\x1b[0m] | [${colorMethod(method)}] ${url} | Database Validation/Initialization error`,
        {
          stack: (exception as Error).stack,
        },
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = t("errors.INTERNAL_ERROR");
      errorType = "UNKNOWN";

      this.logger.error(
        `\x1b[31m✖\x1b[0m  [\x1b[31m${errorType}\x1b[0m] | [${colorMethod(method)}] ${url} | ${exception instanceof Error ? exception.message : "Unknown error"}`,
        {
          stack: exception instanceof Error ? exception.stack : undefined,
        },
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorType,
      requestId: requestContext?.requestId,
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}
