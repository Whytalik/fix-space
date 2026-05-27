import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/database", "/settings"];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (refreshToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|public|__webpack_hmr).*)"],
};
