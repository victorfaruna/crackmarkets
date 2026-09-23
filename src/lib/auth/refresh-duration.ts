export const CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;
export const CUSTOMER_SESSION_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const SESSION_TOKEN_PREFIX = "session_";

// The prefix survives rotation without a schema change. Tokens are still looked up
// by their full SHA-256 hash before the server trusts the session choice.
export function createCustomerRefreshToken(
  randomToken: string,
  rememberDevice: boolean,
) {
  return rememberDevice ? randomToken : `${SESSION_TOKEN_PREFIX}${randomToken}`;
}

export function isBrowserSessionToken(token: string) {
  return token.startsWith(SESSION_TOKEN_PREFIX);
}

export function customerRefreshTokenMaxAgeSeconds(token: string) {
  return isBrowserSessionToken(token)
    ? CUSTOMER_SESSION_TOKEN_MAX_AGE_SECONDS
    : CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS;
}
