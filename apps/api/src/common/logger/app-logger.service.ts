import { Injectable, Logger } from "@nestjs/common";

import { getRequestContext } from "../context/request-context";

@Injectable()
export class AppLogger {
  private logger = new Logger();

  setContext(context: string) {
    this.logger = new Logger(context);
  }

  error(message: string, details?: Record<string, unknown>) {
    this.logger.error(this.format(message, details));
  }

  warn(message: string, details?: Record<string, unknown>) {
    this.logger.warn(this.format(message, details));
  }

  log(message: string, details?: Record<string, unknown>) {
    this.logger.log(this.format(message, details));
  }

  debug(message: string, details?: Record<string, unknown>) {
    this.logger.debug(this.format(message, details));
  }

  private format(message: string, details?: Record<string, unknown>): string {
    const ctx = getRequestContext();
    const parts: string[] = [message];

    const contextParts: string[] = [];
    if (ctx?.requestId) contextParts.push(`reqId=${ctx.requestId.substring(0, 8)}`);
    if (ctx?.userId) contextParts.push(`userId=${ctx.userId}`);

    if (contextParts.length > 0) {
      parts.push(`| ${contextParts.join(", ")}`);
    }

    if (details && Object.keys(details).length > 0) {
      const detailStr = Object.entries(details)
        .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(", ");
      parts.push(`| ${detailStr}`);
    }

    return parts.join(" ");
  }
}
