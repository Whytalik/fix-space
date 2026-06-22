import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

import { RequestContext, requestContextStorage } from "./request-context";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    this.useHandler(req, res, next);
  }

  useHandler(req: Request, res: Response, next: (error?: any) => void) {
    const rawRequestId = req.headers["x-request-id"];
    const clientRequestId = Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId;
    const context: RequestContext = {
      requestId: clientRequestId ?? randomUUID(),
      method: req.method,
      url: req.originalUrl,
      startTime: Date.now(),
    };

    res.setHeader("x-request-id", context.requestId);

    requestContextStorage.run(context, () => {
      next();
    });
  }
}
