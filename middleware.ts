import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "candidate_tracker_session";

const publicPaths = [
  "/login",
  "/api/auth/login",
  "/favicon.ico",
];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt)$/)
  );
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !process.env.SESSION_SECRET) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET),
    );
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth/login") ||
    isPublicAsset(pathname);

  const session = await hasValidSession(request);
  const authenticated = !!session;

  if (pathname === "/login" && authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublic) {
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    session?.role === "guest" &&
    !pathname.startsWith("/api/") &&
    pathname !== "/" &&
    pathname !== "/candidates"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    session?.role !== "admin" &&
    !pathname.startsWith("/api/") &&
    (pathname === "/candidates/new" || pathname === "/roles/new")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
