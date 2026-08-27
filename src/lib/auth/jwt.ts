import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crackmarkets-super-secure-jwt-secret-key-32chars!",
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  status: string;
  kycStatus: string;
  fundingStatus: string;
}

// 15 minutes for access token
export const ACCESS_TOKEN_EXPIRY = "15m";
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 900 seconds

// 7 days for refresh token
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

/**
 * Signs a short-lived access JWT token.
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes an access JWT token.
 */
export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      status: payload.status as string,
      kycStatus: payload.kycStatus as string,
      fundingStatus: payload.fundingStatus as string,
    };
  } catch {
    return null;
  }
}

/**
 * Generates an opaque, cryptographically secure random token string for refresh tokens, verification tokens, etc.
 */
export function generateRandomToken(bytes: number = 48): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hashes a token with SHA-256 for secure database lookup/storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
