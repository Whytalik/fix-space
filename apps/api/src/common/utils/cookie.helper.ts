import { Response } from 'express';

export interface CookieOptions {
  domain: string;
  secure: boolean;
}

export function setAccessTokenCookie(res: Response, token: string, maxAgeMs: number, options: CookieOptions): void {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: options.secure,
    sameSite: 'lax',
    domain: options.domain,
    path: '/',
    maxAge: maxAgeMs,
  });
}

export function setRefreshTokenCookie(res: Response, token: string, maxAgeMs: number, options: CookieOptions): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: options.secure,
    sameSite: 'lax',
    domain: options.domain,
    path: '/auth',
    maxAge: maxAgeMs,
  });
}

export function clearAuthCookies(res: Response, options: CookieOptions): void {
  const shared = {
    httpOnly: true,
    secure: options.secure,
    sameSite: 'lax' as const,
    domain: options.domain,
  };

  res.clearCookie('access_token', { ...shared, path: '/' });
  res.clearCookie('refresh_token', { ...shared, path: '/auth' });
}

export function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)(m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
}
