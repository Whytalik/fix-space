import { Injectable, Logger } from "@nestjs/common";

import { getRequestContext } from "../context/request-context";

@Injectable()
export class AppLogger {
  private readonly logger = new Logger();
  private contextName = "";

  setContext(context: string) {
    this.contextName = context;
  }

  error(message: string, details?: Record<string, unknown>) {
    this.logger.error(this.format(message, details), undefined, this.contextName);
  }

  warn(message: string, details?: Record<string, unknown>) {
    this.logger.warn(this.format(message, details), this.contextName);
  }

  log(message: string, details?: Record<string, unknown>) {
    this.logger.log(this.format(message, details), this.contextName);
  }

  debug(message: string, details?: Record<string, unknown>) {
    this.logger.debug(this.format(message, details), this.contextName);
  }

  private format(message: string, details?: Record<string, unknown>): string {
    const requestContext = getRequestContext();
    const parts: string[] = [message];

    const contextParts: string[] = [];
    if (requestContext?.requestId) {
      contextParts.push(`\x1b[90mreqId=\x1b[36m${requestContext.requestId.substring(0, 8)}\x1b[0m`);
    }
    if (requestContext?.userId) {
      contextParts.push(`\x1b[90muserId=\x1b[35m${requestContext.userId}\x1b[0m`);
    }

    if (contextParts.length > 0) {
      parts.push(`\x1b[90m|\x1b[0m ${contextParts.join("\x1b[90m, \x1b[0m")}`);
    }

    if (details && Object.keys(details).length > 0) {
      const detailsText = Object.entries(details)
        .map(([k, v]) => `\x1b[90m${k}=\x1b[0m${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" \x1b[90m,\x1b[0m ");
      parts.push(`\x1b[90m|\x1b[0m ${detailsText}`);
    }

    return parts.join(" ");
  }
}
