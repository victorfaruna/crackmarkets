# Crack Markets — Authentication Architecture & System Specification

Please refer to the active rule definition in [`.agents/rules/auth.md`](file:///Users/theoneglobal/Desktop/Projects/crackmarkets/.agents/rules/auth.md).

## Quick Architecture Summary
- **Database**: Drizzle ORM + PostgreSQL (`src/lib/db/`)
- **Token Model**: Short-lived JWT access token (15m) + Long-lived rotated refresh token (7d) in HTTP-only cookies
- **API Suite**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **10-Level Lineage**: Closure table `referral_nodes` storing `ancestor_id`, `descendant_id`, and `depth` (1–10) created atomically on registration
- **Middleware**: Proactive token rotation in `src/middleware.ts`
