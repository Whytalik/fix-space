import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  clearAuthCookies,
  parseDurationToMs,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../utils/cookie.helper';

export interface AuthCookieData {
  accessToken?: string;
  refreshToken?: string;
  clearCookies?: boolean;
}

@Injectable()
export class AuthCookiesInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const cookieOptions = {
          domain: this.configService.get('COOKIE_DOMAIN', 'localhost'),
          secure: this.configService.get('NODE_ENV') === 'production',
        };

        // Clear cookies if requested
        if (data?.clearCookies) {
          clearAuthCookies(response, cookieOptions);
        }

        // Set access token cookie
        if (data?.accessToken) {
          setAccessTokenCookie(
            response,
            data.accessToken,
            parseDurationToMs(
              this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
            ),
            cookieOptions,
          );
        }

        // Set refresh token cookie
        if (data?.refreshToken) {
          setRefreshTokenCookie(
            response,
            data.refreshToken,
            parseDurationToMs(
              this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            ),
            cookieOptions,
          );
        }

        // Return response without tokens (they're in cookies)
        const { accessToken, refreshToken, clearCookies, ...rest } = data || {};
        return rest;
      }),
    );
  }
}
