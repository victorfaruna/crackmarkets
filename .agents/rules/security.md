# Crack Markets — Comprehensive Security Engineering Rules (Server & Client)

This document establishes the mandatory security standards and best practices that MUST be strictly enforced across all server-side and client-side code in Crack Markets.

---

## 1. Core Security Philosophy

1. **Zero-Trust Client Boundary**: Never trust any data coming from the client (body, headers, query params, cookies, or route params). All inputs must be rigorously validated, sanitized, and authorized on the server.
2. **Defense in Depth**: Implement validation, authentication, authorization, and audit logging at every layer—not just at the edge or middleware.
3. **Least Privilege & Role-Based Access**: Restrict data access to the exact scope necessary for the authenticated user's role (`USER`, `ADMIN`, `SUPPORT`).
4. **Zero Sensitive Data Leakage**: Never log, serialize, or transmit passwords, token hashes, secrets, or internal system details.

---

## 2. Server-Side Security Rules

### 2.1 Input Validation & Sanitization
- **Strict Zod Schemas**: Every API route handler, server action, and webhook must validate request payloads against explicit Zod schemas before processing.
- **Reject & Strip Unexpected Fields**: Use `.strict()` or safe parsing on schemas to prevent mass-assignment vulnerabilities.
- **String Sanitization**: Sanitize, trim, and normalize user inputs (e.g., lowercasing emails) to prevent injection, bypasses, and data corruption.

### 2.2 Authentication & Session Management
- **Dual-Token Architecture**:
  - Short-lived Access Tokens (JWT, 15m) for stateless verification.
  - Long-lived Refresh Tokens (7d) stored as SHA-256 hashes in the database with strict rotation upon consumption.
- **HTTP-Only Secure Cookies**: Auth cookies (`access_token`, `refresh_token`) MUST always be configured with:
  ```typescript
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  }
  ```
- **Cryptographic Randomness**: Use `crypto.randomBytes` or `crypto.getRandomValues` for tokens, nonces, and secrets—never `Math.random()`.
- **Password Hashing**: Always hash passwords using `bcryptjs` with a minimum cost factor of 12.
- **Immediate Session Revocation**: Revoke all active refresh tokens immediately on password reset, email change, or account suspension.

### 2.3 Authorization & Insecure Direct Object References (IDOR)
- **Ownership Verification**: Always verify that the authenticated user owns the resource being accessed or modified (`WHERE resource.user_id = session.userId`).
- **Role Validation**: Explicitly enforce role boundaries (`ADMIN`, `SUPPORT`, `USER`). Never rely on client-provided role claims without verifying them against the database/signed JWT.
- **Account State Verification**: Verify user status (`ACTIVE`, `EMAIL_VERIFICATION_PENDING`, `SUSPENDED`) and KYC status (`APPROVED`) before allowing sensitive financial, trading, or funding actions.

### 2.4 Database & Query Safety
- **ORM Parameterization**: Always use Drizzle ORM query builders and parameterized statements. Never concatenate raw SQL strings.
- **Transactional Atomicity**: All multi-step mutations (e.g., user registration + 10-level referral tree lineage generation + wallet creation) MUST execute within a database transaction (`db.transaction(...)`).
- **Data Pruning / Safe Queries**: Use Drizzle `columns` selection or DTO mappers to select only required columns. Never `SELECT *` and blindly return the result to the client.

### 2.5 Error Handling & Information Disclosure
- **Sanitized Client Errors**: Return clear, generic error messages to clients (e.g., `"Invalid credentials"`, `"Unable to process request"`).
- **No Stack Traces**: Never expose database error codes, SQL queries, or internal stack traces in HTTP responses.
- **Structured Server Logging**: Log detailed error diagnostics internally with context (user ID, request path, timestamp) while masking sensitive credentials and tokens.

### 2.6 Audit Logging & Abuse Prevention
- **Comprehensive Audit Trail**: Record critical user and administrative actions (`USER_REGISTER`, `USER_LOGIN`, `USER_LOGOUT`, `PASSWORD_RESET`, `KYC_SUBMIT`, `COMMISSION_PAYOUT`) in `audit_logs` with IP address, user agent, and metadata.
- **Rate Limiting**: Protect public and sensitive auth endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`) against brute force and automated attacks.

---

## 3. Client-Side Security Rules

### 3.1 Token & Secret Storage
- **NO Sensitive Data in Web Storage**: Never store JWT access tokens, refresh tokens, passwords, or private API keys in `localStorage`, `sessionStorage`, or global `window` objects (mitigating XSS extraction risks).
- **Environment Variable Protection**: Never prefix secret keys or backend credentials with `NEXT_PUBLIC_`. Only expose public constants (e.g., `NEXT_PUBLIC_APP_URL`).

### 3.2 Cross-Site Scripting (XSS) Prevention
- **Avoid Dangerous HTML Injection**: Never use `dangerouslySetInnerHTML` unless rendering sanitized content vetted by a robust HTML sanitization library.
- **Leverage React Escaping**: Rely on React's default text node encoding for rendering user-supplied strings.
- **External URL Validation**: Validate and sanitize external links before rendering `<a href="...">` to prevent `javascript:` pseudo-protocol injection.

### 3.3 CSRF & Safe Navigation
- **Origin & Header Validation**: Ensure state-changing API requests use standard `application/json` content types and proper SameSite cookie configurations.
- **Open Redirect Protection**: When redirecting after login or logout (e.g., `?redirect=/dashboard`), validate that the target URL is a relative path or an allowed domain to prevent open redirect phishing.

### 3.4 State Management & Form Security
- **Zustand Store Hygiene**: Store only non-sensitive UI and session metadata (e.g., user profile info, display preferences) in client state stores.
- **Bot Mitigation**: Integrate Cloudflare Turnstile verification on registration, login, and public lead forms.
- **Password & Form Controls**:
  - Mask password fields with accessible toggle mechanisms.
  - Disable browser autocomplete/caching on sensitive one-time security codes when appropriate.
  - Clear sensitive form inputs upon component unmount.

### 3.5 Client Validation as UX Only
- **Never Rely on Client-Side Validation for Security**: Client-side validation (Zod, React Hook Form, HTML5 constraints) is purely for user experience and fast feedback. The server is always the ultimate security gate.

---

## 4. Security Checklist for Every Feature

Before completing any feature, verify:
- [ ] Are all API inputs validated with strict Zod schemas?
- [ ] Is authentication and resource ownership verified on the server?
- [ ] Are sensitive fields (`password_hash`, `token_hash`, secrets) omitted from the response?
- [ ] Are all database operations parameterized and wrapped in transactions where necessary?
- [ ] Are all auth cookies configured with `httpOnly`, `secure`, and `sameSite`?
- [ ] Is error output sanitized so internal details/stack traces are not leaked?
- [ ] Are sensitive actions logged to `audit_logs`?
- [ ] Are secrets excluded from client bundles and web storage?
