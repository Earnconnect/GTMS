import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLE_HOME } from "@/lib/constants";

const WORKER_PREFIX = "/dashboard";
const BUSINESS_PREFIX = "/business";
const ADMIN_PREFIX = "/admin";

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password") ||
    nextUrl.pathname.startsWith("/verify-email");

  const isProtected =
    nextUrl.pathname.startsWith(WORKER_PREFIX) ||
    nextUrl.pathname.startsWith("/browse") ||
    nextUrl.pathname.startsWith("/tasks") ||
    nextUrl.pathname.startsWith("/work") ||
    nextUrl.pathname.startsWith(BUSINESS_PREFIX) ||
    nextUrl.pathname.startsWith(ADMIN_PREFIX);

  if (isAuthRoute && isLoggedIn) {
    const home = ROLE_HOME[session.user.role] ?? "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isProtected) {
    const { role } = session.user;
    if (nextUrl.pathname.startsWith(ADMIN_PREFIX) && role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }
    if (nextUrl.pathname.startsWith(BUSINESS_PREFIX) && role !== "BUSINESS" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }
    if (
      (nextUrl.pathname.startsWith(WORKER_PREFIX) ||
        nextUrl.pathname.startsWith("/browse") ||
        nextUrl.pathname.startsWith("/tasks") ||
        nextUrl.pathname.startsWith("/work")) &&
      role !== "WORKER" && role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
