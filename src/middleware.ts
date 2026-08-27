import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crackmarkets-super-secure-jwt-secret-key-32chars!",
);

// Protected routes requiring authentication
const PROTECTED_PREFIXES = ["/dashboard"];

// Public auth routes that should redirect to dashboard when already logged in
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Validates a JWT access token cryptographically using jose (Edge runtime compatible).
 */
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Proactively refreshes expired access tokens using the refresh token cookie.
 */
async function refreshTokens(
  refreshToken: string,
  origin: string,
): Promise<string[] | null> {
  try {
    const refreshEndpoint = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`
      : `${origin}/api/auth/refresh`;

    const response = await fetch(refreshEndpoint, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!response.ok) return null;

    return response.headers.getSetCookie();
  } catch (error) {
    console.error("Middleware token refresh failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Fast path: skip if not a protected route and not an auth route
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  let verifiedPayload = accessToken ? await verifyToken(accessToken) : null;
  let newSetCookies: string[] | null = null;

  // 🔄 Proactive Refresh: If access token is invalid/expired but refresh token exists
  if (!verifiedPayload && refreshToken) {
    newSetCookies = await refreshTokens(refreshToken, request.nextUrl.origin);

    if (newSetCookies && newSetCookies.length > 0) {
      // Extract the new access_token from the set-cookie headers
      const accessTokenCookie = newSetCookies.find((c) =>
        c.startsWith("access_token="),
      );

      if (accessTokenCookie) {
        const match = accessTokenCookie.match(/access_token=([^;]+)/);
        if (match) {
          accessToken = match[1];
          verifiedPayload = await verifyToken(accessToken);
        }
      }
    }
  }

  const isAuthenticated = Boolean(verifiedPayload);

  // 🔒 1. Protect private routes: Redirect unauthenticated users to /login
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    const destination = `${pathname}${search}`;
    if (destination !== "/dashboard") {
      redirectUrl.searchParams.set("redirect", destination);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 🚫 2. Redirect logged-in users away from auth pages to /dashboard
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // ✅ 3. Build response and propagate new cookies if a refresh occurred
  let response = NextResponse.next();

  if (newSetCookies && newSetCookies.length > 0) {
    if (accessToken) {
      request.cookies.set("access_token", accessToken);
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
    }

    newSetCookies.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
