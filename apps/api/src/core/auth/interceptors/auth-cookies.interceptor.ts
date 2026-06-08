import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  clearAuthCookies,
  parseDurationToMs,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  type CookieOptions,
} from "../utils/cookie.helper";

export interface AuthCookieData {
  accessToken?: string;
  refreshToken?: string;
  clearCookies?: boolean;
  redirectUrl?: string;
}

@Injectable()
export class AuthCookiesInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        const cookieData = (data ?? {}) as AuthCookieData;
        const response = context.switchToHttp().getResponse<Response>();
        const cookieDomain = this.configService.get<string>("COOKIE_DOMAIN", "");
        const cookieOptions: CookieOptions = {
          secure: this.configService.get("NODE_ENV") === "production" && this.configService.get("COOKIE_SECURE") !== "false",
        };
        if (cookieDomain && cookieDomain !== "localhost") {
          cookieOptions.domain = cookieDomain;
        }

        if (cookieData.clearCookies) {
          clearAuthCookies(response, cookieOptions);
        }

        if (cookieData.accessToken) {
          setAccessTokenCookie(
            response,
            cookieData.accessToken,
            parseDurationToMs(this.configService.get("JWT_ACCESS_EXPIRATION", "15m")),
            cookieOptions,
          );
        }

        if (cookieData.refreshToken) {
          setRefreshTokenCookie(
            response,
            cookieData.refreshToken,
            parseDurationToMs(this.configService.get("JWT_REFRESH_EXPIRATION", "7d")),
            cookieOptions,
          );
        }

        if (cookieData.redirectUrl) {
          response.redirect(String(cookieData.redirectUrl));
          return undefined;
        }

        const rest: Record<string, unknown> = { ...cookieData };
        delete rest["clearCookies"];
        delete rest["redirectUrl"];
        return rest;
      }),
    );
  }
}
