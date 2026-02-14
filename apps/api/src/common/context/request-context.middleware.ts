import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

import {
  RequestContext,
  requestContextStorage,
} from './request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context: RequestContext = {
      requestId: (req.headers['x-request-id'] as string) || randomUUID(),
      method: req.method,
      url: req.originalUrl,
      startTime: Date.now(),
    };

    res.setHeader('x-request-id', context.requestId);

    requestContextStorage.run(context, () => {
      next();
    });
  }
}