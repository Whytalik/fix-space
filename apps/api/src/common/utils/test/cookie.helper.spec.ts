import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";

import { clearAuthCookies, parseDurationToMs, setAccessTokenCookie, setRefreshTokenCookie } from "../cookie.helper";

describe("cookie.helper", () => {
  let resCookie: jest.Mock<any>;
  let resClearCookie: jest.Mock<any>;
  let res: { cookie: jest.Mock<any>; clearCookie: jest.Mock<any> };

  beforeEach(() => {
    jest.clearAllMocks();
    resCookie = jest.fn<any>();
    resClearCookie = jest.fn<any>();
    res = { cookie: resCookie, clearCookie: resClearCookie };
  });

  describe("setAccessTokenCookie", () => {
    it("should call res.cookie with access_token and correct options", () => {
      setAccessTokenCookie(res as unknown as Response, "my-token", 900000, { domain: "localhost", secure: false });

      expect(resCookie).toHaveBeenCalledWith("access_token", "my-token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        domain: "localhost",
        path: "/",
        maxAge: 900000,
      });
    });
  });

  describe("setRefreshTokenCookie", () => {
    it("should call res.cookie with refresh_token and path /auth", () => {
      setRefreshTokenCookie(res as unknown as Response, "ref-token", 604800000, { domain: "localhost", secure: true });

      expect(resCookie).toHaveBeenCalledWith("refresh_token", "ref-token", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        domain: "localhost",
        path: "/auth",
        maxAge: 604800000,
      });
    });
  });

  describe("clearAuthCookies", () => {
    it("should call res.clearCookie for both tokens", () => {
      clearAuthCookies(res as unknown as Response, { domain: "localhost", secure: false });

      expect(resClearCookie).toHaveBeenCalledWith("access_token", expect.objectContaining({ path: "/" }));
      expect(resClearCookie).toHaveBeenCalledWith("refresh_token", expect.objectContaining({ path: "/auth" }));
    });
  });

  describe("parseDurationToMs", () => {
    it('should parse "15m" to 900000', () => {
      expect(parseDurationToMs("15m")).toBe(900000);
    });

    it('should parse "2h" to 7200000', () => {
      expect(parseDurationToMs("2h")).toBe(7200000);
    });

    it('should parse "7d" to 604800000', () => {
      expect(parseDurationToMs("7d")).toBe(604800000);
    });

    it("should throw Error for invalid duration format", () => {
      expect(() => parseDurationToMs("invalid")).toThrow(Error);
    });

    it("should throw Error for partially invalid format", () => {
      expect(() => parseDurationToMs("10x")).toThrow(Error);
    });
  });
});
