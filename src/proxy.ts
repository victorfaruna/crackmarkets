import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { requireServerEnv } from "@/src/lib/config/env";

const JWT_SECRET = new TextEncoder().encode(
  requireServerEnv("JWT_SECRET"),
);

// Protected routes requiring authentication
const PROTECTED_PREFIXES = ["/dashboard"];

// Public auth routes that should redirect to the customer profile when already logged in
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
        Origin: origin,
      },
    });

    if (!response.ok) return null;

    return response.headers.getSetCookie();
  } catch (error) {
    console.error("Proxy token refresh failed:", error);
    return null;
  }
}

async function refreshAdminTokens(
  refreshToken: string,
  origin: string,
): Promise<string[] | null> {
  try {
    const response = await fetch(`${origin}/api/admin/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `admin_refresh_token=${refreshToken}`,
        Origin: origin,
      },
    });

    if (!response.ok) return null;
    return response.headers.getSetCookie();
  } catch (error) {
    console.error("Admin proxy token refresh failed:", error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/api/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    if (
      (origin && origin !== request.nextUrl.origin) ||
      fetchSite === "cross-site"
    ) {
      return NextResponse.json(
        { success: false, message: "Cross-site request rejected." },
        { status: 403 },
      );
    }
  }

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute) {
    let adminAccessToken = request.cookies.get("admin_access_token")?.value;
    const adminRefreshToken = request.cookies.get("admin_refresh_token")?.value;
    let adminPayload = adminAccessToken ? await verifyToken(adminAccessToken) : null;
    let adminSetCookies: string[] | null = null;

    const isValidAdmin =
      adminPayload?.scope === "admin" && adminPayload?.role === "ADMIN";

    if (!isValidAdmin && adminRefreshToken) {
      adminSetCookies = await refreshAdminTokens(
        adminRefreshToken,
        request.nextUrl.origin,
      );
      const accessCookie = adminSetCookies?.find((cookie) =>
        cookie.startsWith("admin_access_token="),
      );
      const match = accessCookie?.match(/admin_access_token=([^;]+)/);
      if (match) {
        adminAccessToken = match[1];
        adminPayload = await verifyToken(adminAccessToken);
      }
    }

    const isAuthenticatedAdmin =
      adminPayload?.scope === "admin" && adminPayload?.role === "ADMIN";

    if (!isAdminLogin && !isAuthenticatedAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAdminLogin && isAuthenticatedAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    let adminResponse = NextResponse.next();
    if (adminSetCookies?.length) {
      if (adminAccessToken) request.cookies.set("admin_access_token", adminAccessToken);
      adminResponse = NextResponse.next({ request: { headers: request.headers } });
      adminSetCookies.forEach((cookie) => adminResponse.headers.append("Set-Cookie", cookie));
    }
    return adminResponse;
  }

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

  // 🚫 2. Redirect logged-in users away from auth pages to their profile
  if (isAuthRoute && isAuthenticated) {
    const profileUrl = new URL("/dashboard/profile", request.url);
    const profileResponse = NextResponse.redirect(profileUrl);
    newSetCookies?.forEach((cookie) => {
      profileResponse.headers.append("Set-Cookie", cookie);
    });
    return profileResponse;
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
    "/api/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
