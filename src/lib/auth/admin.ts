import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { requireServerEnv } from "@/src/lib/config/env";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";

export const ADMIN_ACCESS_COOKIE_NAME = "admin_access_token";
export const ADMIN_REFRESH_COOKIE_NAME = "admin_refresh_token";
export const ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;

const ADMIN_ACCESS_TOKEN_EXPIRY = "15m";
const JWT_SECRET = new TextEncoder().encode(requireServerEnv("JWT_SECRET"));

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: "ADMIN";
  scope: "admin";
}

export async function signAdminAccessToken(
  payload: Omit<AdminTokenPayload, "scope">,
): Promise<string> {
  return new SignJWT({ ...payload, scope: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAdminAccessToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.scope !== "admin" || payload.role !== "ADMIN") return null;

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: "ADMIN",
      scope: "admin",
    };
  } catch {
    return null;
  }
}

async function validateCurrentAdmin(payload: AdminTokenPayload | null) {
  if (!payload) return null;

  const [admin] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!admin || admin.role !== "ADMIN" || admin.status !== "ACTIVE") {
    return null;
  }

  return admin;
}

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_ACCESS_COOKIE_NAME)?.value;
  return validateCurrentAdmin(token ? await verifyAdminAccessToken(token) : null);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE_NAME)?.value;
  return validateCurrentAdmin(token ? await verifyAdminAccessToken(token) : null);
}
