import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { getRequestContext } from '../context/request-context';

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Referenced resource not found',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const httpCtx = host.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();
    const reqContext = getRequestContext();

    const requestId = reqContext?.requestId?.substring(0, 8) || 'no-id';
    const userId = reqContext?.userId || 'anonymous';
    const { method, url } = request;

    let status: number;
    let message: string | string[];
    let errorType: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>).message as
              | string
              | string[]);
      errorType = 'HTTP';

      if (status >= 500) {
        this.logger.error(
          `${errorType} ${status} | ${method} ${url} | ${message} | reqId=${requestId}, userId=${userId}`,
          exception.stack,
        );
      } else if (status === 401 || status === 403) {
        this.logger.warn(
          `${errorType} ${status} | ${method} ${url} | ${message} | reqId=${requestId}, userId=${userId}`,
        );
      } else {
        this.logger.log(
          `${errorType} ${status} | ${method} ${url} | ${message} | reqId=${requestId}, userId=${userId}`,
        );
      }
    } else if (this.isPrismaError(exception)) {
      const prismaCode = (exception as { code: string }).code;
      const mapped = PRISMA_ERROR_MAP[prismaCode];
      errorType = 'DATABASE';

      if (mapped) {
        status = mapped.status;
        message = mapped.message;
        this.logger.warn(
          `${errorType} ${prismaCode} | ${method} ${url} | ${message} | reqId=${requestId}, userId=${userId}`,
        );
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        this.logger.error(
          `${errorType} ${prismaCode} | ${method} ${url} | Unhandled Prisma error | reqId=${requestId}, userId=${userId}`,
          (exception as Error).stack,
        );
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorType = 'UNKNOWN';

      this.logger.error(
        `${errorType} | ${method} ${url} | ${(exception as Error)?.message || 'Unknown error'} | reqId=${requestId}, userId=${userId}`,
        (exception as Error)?.stack,
      );
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
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string' &&
      (exception as { code: string }).code.startsWith('P')
    );
  }
}
