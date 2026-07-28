import { NextResponse, type NextRequest } from "next/server";

// Coarse gate only: presence of an Auth.js session cookie decides
// authenticated vs. anonymous. Real role + status enforcement happens
// server-side in each route group's layout (requireRole) and in services.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/browse",
  "/work",
  "/submissions",
  "/wallet",
  "/disputes",
  "/tasks",
  "/requester",
  "/admin",
];

const AUTH_PAGES = ["/login", "/register"];

function hasSession(req: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = hasSession(req);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (authed && AUTH_PAGES.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/browse/:path*",
    "/work/:path*",
    "/submissions/:path*",
    "/wallet/:path*",
    "/disputes/:path*",
    "/tasks/:path*",
    "/requester/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
