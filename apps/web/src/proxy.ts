import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);

const protectedRoutes = ["/database", "/settings", "/profile", "/record"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = intlProxy(request);

  if (response.status === 307 || response.status === 308) {
    return response;
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(uk|en)/, "") || "/";
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken && protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    const locale = pathname.split("/")[1] || "uk";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && (pathnameWithoutLocale === "/login" || pathnameWithoutLocale === "/register")) {
    const locale = pathname.split("/")[1] || "uk";
    const homeUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(uk|en)/:path*", "/((?!api|_next/static|_next/image|.*\\..*|public|avatars|__webpack_hmr).*)"],
};
