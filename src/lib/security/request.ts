import crypto from "crypto";
import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getRequestMetadata(request: NextRequest) {
  return {
    ipAddress: getClientIp(request),
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}

export function anonymizeRateLimitKey(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
