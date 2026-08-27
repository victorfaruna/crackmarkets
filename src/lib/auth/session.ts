import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { verifyAccessToken, type TokenPayload } from "./jwt";
import { ACCESS_COOKIE_NAME } from "./cookies";
import { db } from "../db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";

/**
 * Extracts and verifies the user payload from the incoming NextRequest.
 */
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<TokenPayload | null> {
  const authHeader = request.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyAccessToken(token);
}

/**
 * Extracts the user payload in Server Components or Route Handlers via Next.js cookies().
 */
export async function getCurrentUserSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Fetches the full user record from the database for the currently authenticated session.
 */
export async function getCurrentUser() {
  const session = await getCurrentUserSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      country: users.country,
      referralCode: users.referralCode,
      referredById: users.referredById,
      status: users.status,
      kycStatus: users.kycStatus,
      fundingStatus: users.fundingStatus,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}
