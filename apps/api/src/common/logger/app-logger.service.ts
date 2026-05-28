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
    if (ctx?.requestId) {
      contextParts.push(`\x1b[90mreqId=\x1b[36m${ctx.requestId.substring(0, 8)}\x1b[0m`);
    }
    if (ctx?.userId) {
      contextParts.push(`\x1b[90muserId=\x1b[35m${ctx.userId}\x1b[0m`);
    }

    if (contextParts.length > 0) {
      parts.push(`\x1b[90m|\x1b[0m ${contextParts.join("\x1b[90m, \x1b[0m")}`);
    }

    if (details && Object.keys(details).length > 0) {
      const detailStr = Object.entries(details)
        .map(([k, v]) => `\x1b[90m${k}=\x1b[0m${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" \x1b[90m,\x1b[0m ");
      parts.push(`\x1b[90m|\x1b[0m ${detailStr}`);
    }

    return parts.join(" ");
  }
}
