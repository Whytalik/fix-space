import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ArgumentsHost} from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";

jest.mock("../../context/request-context", () => ({
  getRequestContext: jest.fn<any>(),
}));

import { getRequestContext } from "../../context/request-context";
import type { AppLogger } from "../../logger/app-logger.service";
import { GlobalExceptionFilter } from "../global-exception.filter";

const mockLogger = {
  setContext: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
  debug: jest.fn<any>(),
};

function makeHost(method = "GET", url = "/test"): { host: ArgumentsHost; json: jest.Mock<any> } {
  const json = jest.fn<any>();
  const status = jest.fn<any>().mockReturnValue({ json });
  const request = { method, url };
  const response = { status };

  const host = {
    switchToHttp: jest.fn<any>().mockReturnValue({
      getRequest: jest.fn<any>().mockReturnValue(request),
      getResponse: jest.fn<any>().mockReturnValue(response),
    }),
  } as unknown as ArgumentsHost;

  return { host, json };
}

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    (getRequestContext as jest.Mock<any>).mockReturnValue({ requestId: "req-1" });
    filter = new GlobalExceptionFilter(mockLogger as unknown as AppLogger);
  });

  describe("HttpException handling", () => {
    it("should call logger.log and respond with correct status for 2xx", () => {
      const { host, json } = makeHost();
      const exception = new HttpException("OK", HttpStatus.OK);

      filter.catch(exception, host);

      expect(mockLogger.log).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });

    it("should call logger.log for 4xx (non-401/403)", () => {
      const { host } = makeHost();
      const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);

      filter.catch(exception, host);

      expect(mockLogger.log).toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should call logger.warn for 401", () => {
      const { host } = makeHost();
      const exception = new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      filter.catch(exception, host);

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("should call logger.warn for 403", () => {
      const { host } = makeHost();
      const exception = new HttpException("Forbidden", HttpStatus.FORBIDDEN);

      filter.catch(exception, host);

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("should call logger.error for 5xx", () => {
      const { host } = makeHost();
      const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(exception, host);

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("Prisma error handling", () => {
    function makePrismaError(code: string): Error & { code: string } {
      const err = new Error(`Prisma error ${code}`) as Error & { code: string };
      err.code = code;
      return err;
    }

    it("should respond with 409 for P2002", () => {
      const { host, json } = makeHost();
      filter.catch(makePrismaError("P2002"), host);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.CONFLICT }));
    });

    it("should respond with 400 for P2003", () => {
      const { host, json } = makeHost();
      filter.catch(makePrismaError("P2003"), host);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.BAD_REQUEST }));
    });

    it("should respond with 404 for P2025", () => {
      const { host, json } = makeHost();
      filter.catch(makePrismaError("P2025"), host);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.NOT_FOUND }));
    });

    it("should respond with 500 for unknown Prisma code and call logger.error", () => {
      const { host, json } = makeHost();
      filter.catch(makePrismaError("P9999"), host);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR }));
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("generic Error handling", () => {
    it("should respond with 500 and call logger.error for unknown errors", () => {
      const { host, json } = makeHost();
      filter.catch(new Error("something blew up"), host);

      expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR }));
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
