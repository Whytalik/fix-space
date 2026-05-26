import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: AppLogger;

  constructor(logger: AppLogger) {
    this.logger = logger;
    this.logger.setContext("ExceptionFilter");
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const httpCtx = host.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();
    const reqContext = getRequestContext();

    const { method, url } = request;

    let status: number;
    let message: string | string[];
    let errorType: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>).message as string | string[]);
      errorType = "HTTP";

      if (status >= 500) {
        this.logger.error(`${errorType} ${status} | ${method} ${url} | ${message}`, {
          stack: exception.stack,
        });
      } else if (status === 401 || status === 403) {
        this.logger.warn(`${errorType} ${status} | ${method} ${url} | ${message}`);
      } else {
        this.logger.log(`${errorType} ${status} | ${method} ${url} | ${message}`);
      }
    } else if (this.isPrismaError(exception)) {
      const prismaCode = (exception as { code: string }).code;
      const mapped = PRISMA_ERROR_MAP[prismaCode];
      errorType = "DATABASE";

      if (mapped) {
        status = mapped.status;
        message = t(mapped.i18nKey);
        this.logger.warn(`${errorType} ${prismaCode} | ${method} ${url} | ${message}`);
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = t("errors.INTERNAL_ERROR");
        this.logger.error(`${errorType} ${prismaCode} | ${method} ${url} | Unhandled Prisma error`, {
          stack: (exception as Error).stack,
        });
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = t("errors.INTERNAL_ERROR");
      errorType = "UNKNOWN";

      this.logger.error(`${errorType} | ${method} ${url} | ${(exception as Error)?.message || "Unknown error"}`, {
        stack: (exception as Error)?.stack,
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorType,
      requestId: reqContext?.requestId,
      timestamp: new Date().toISOString(),
      path: url,
    });
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      "code" in exception &&
      typeof (exception as { code: unknown }).code === "string" &&
      (exception as { code: string }).code.startsWith("P")
    );
  }
}
