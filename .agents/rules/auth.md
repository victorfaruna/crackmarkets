# Crack Markets — Authentication Architecture & System Rules

## 1. Core Auth Lifecycle & Philosophy

1. **Broker vs Platform Separation**:
   - Trading activity, deposits, lots, and broker account metrics come from the RoboForex integration.
   - User identity, 10-level referral networks, qualification tiers, commission calculations, wallets, and authentication are managed strictly by Crack Markets.

2. **User Lifecycle States**:
   - `EMAIL_VERIFICATION_PENDING`: Initial state upon registration. User receives a verification link with an encrypted token.
   - `ACTIVE`: Email is verified. User can access the dashboard and share their referral link.
   - `SUSPENDED`: Access blocked across all protected endpoints.

3. **KYC & Funding Decoupling**:
   - `kyc_status`: `NOT_SUBMITTED` -> `PENDING` -> `APPROVED` | `REJECTED`.
   - `funding_status`: `LOCKED` until `kyc_status === 'APPROVED'`.
   - **Rule**: Users MUST be allowed to register, log in, view the dashboard, and share their 10-level referral code BEFORE KYC approval. Only deposit funding and active trading features are gated behind approved KYC.

---

## 2. Session & Token Management Strategy

### Dual-Token Architecture with Token Rotation
- **Access Token (JWT)**:
  - Expiry: 15 minutes (`15m`).
  - Algorithm: `HS256`.
  - Stored in: HTTP-only cookie `access_token` and returned in API response.
  - Payload: `{ userId, email, role, status, kycStatus, fundingStatus, iat, exp }`.
- **Refresh Token (Opaque Hash)**:
  - Expiry: 7 days.
  - Generated as a 48-byte cryptographically secure random string.
  - Stored in: Database table `refresh_tokens` as a SHA-256 hash (`token_hash`).
  - Stored in browser as: HTTP-only, `SameSite=Lax`, secure cookie `refresh_token`.
  - **Rotation Policy**: Every call to `/api/auth/refresh` immediately revokes the consumed refresh token (`revoked_at = NOW()`) and issues a brand-new refresh token pair.

### Proactive Middleware Refresh
- Next.js middleware in `src/middleware.ts` intercepts requests:
  - If `access_token` is missing or expired, but `refresh_token` exists, it calls `/api/auth/refresh` behind the scenes and attaches the updated cookies to both the browser response and downstream SSR request headers.

---

## 3. Database Schema Specifications (Drizzle ORM)

All database operations use Drizzle ORM configured with PostgreSQL (`src/lib/db/`).

### Tables & Key Columns
- **`users`**:
  - `id`: UUID (Primary Key, default random)
  - `first_name`, `last_name`: Varchar(100)
  - `email`: Varchar(255) (Unique, Indexed, Lowercased)
  - `phone_number`: Varchar(50)
  - `country`: Varchar(100)
  - `password_hash`: Varchar(255) (bcrypt, cost factor 12)
  - `referral_code`: Varchar(50) (Unique, Indexed, e.g., `CRK...`)
  - `referred_by_id`: UUID (Foreign Key -> `users.id`, nullable)
  - `status`: Varchar(50) (`EMAIL_VERIFICATION_PENDING`, `ACTIVE`, `SUSPENDED`)
  - `kyc_status`: Varchar(50) (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`)
  - `funding_status`: Varchar(50) (`LOCKED`, `UNLOCKED`)
  - `role`: Varchar(50) (`USER`, `ADMIN`, `SUPPORT`)
  - `created_at`, `updated_at`: Timestamps with timezone

- **`refresh_tokens`**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (FK -> `users.id`, cascade delete)
  - `token_hash`: Varchar(255) (Unique, Indexed)
  - `user_agent`: Varchar(500)
  - `ip_address`: Varchar(100)
  - `expires_at`: Timestamp with timezone
  - `revoked_at`: Timestamp with timezone (Nullable)
  - `created_at`: Timestamp with timezone

- **`email_verification_tokens`**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (FK -> `users.id`, cascade delete)
  - `token_hash`: Varchar(255) (Unique, Indexed)
  - `expires_at`: Timestamp with timezone (24 hours)

- **`password_reset_tokens`**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (FK -> `users.id`, cascade delete)
  - `token_hash`: Varchar(255) (Unique, Indexed)
  - `expires_at`: Timestamp with timezone (1 hour)
  - `used_at`: Timestamp with timezone (Nullable)

- **`audit_logs`**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (FK -> `users.id`, set null)
  - `action`: Varchar(100) (`USER_REGISTER`, `USER_LOGIN`, `USER_LOGOUT`, `TOKEN_REFRESH`, `EMAIL_VERIFY`, `PASSWORD_RESET_REQUEST`, `PASSWORD_RESET_COMPLETE`)
  - `ip_address`, `user_agent`: Varchar
  - `details`: JSONB
  - `created_at`: Timestamp with timezone

- **`referral_nodes`** (10-Level Lineage Table):
  - `id`: UUID (Primary Key)
  - `ancestor_id`: UUID (FK -> `users.id`)
  - `descendant_id`: UUID (FK -> `users.id`)
  - `depth`: Integer (1 to 10)

- **`wallets`**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (FK -> `users.id`, Unique)
  - `balance`, `available_balance`, `total_withdrawn`, `lifetime_earnings`: Numeric(20, 4)

---

## 4. Auth API Endpoints Standard

All Next.js API route handlers must adhere to the standardized response envelope:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create account, init wallet, build 10-level tree | No |
| `/api/auth/login` | `POST` | Authenticate credentials & issue token cookies | No |
| `/api/auth/refresh` | `POST` | Rotate refresh token & issue new access token | Cookie |
| `/api/auth/logout` | `POST` | Revoke refresh token & clear auth cookies | Cookie |
| `/api/auth/me` | `GET` | Return authenticated user & wallet profile | Session / Token |
| `/api/auth/verify-email` | `POST` | Verify email address using token | No |
| `/api/auth/forgot-password` | `POST` | Request password reset token | No |
| `/api/auth/reset-password` | `POST` | Reset password using valid token | No |

---

## 5. Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/crackmarkets` |
| `JWT_SECRET` | 32+ character JWT signing key | `crackmarkets-super-secure-jwt-secret-key-32chars!` |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Internal API route base | `/api` |

---

## 6. Security & Invariant Rules

1. **Never Store Plaintext Passwords**: Passwords must always be hashed with `bcryptjs` using a minimum work factor of 12.
2. **Never Return Sensitive Data**: Never include `password_hash`, `token_hash`, or internal secrets in API responses.
3. **HTTP-Only Cookies**: Tokens stored in cookies must always use `httpOnly: true`, `sameSite: "lax"`, and `secure: process.env.NODE_ENV === "production"`.
4. **Referral Attribution Atomicity**: When a user registers with a referral code, the direct link and all ancestor links up to depth 10 must be recorded atomically within the registration database transaction.
5. **Session Revocation on Password Reset**: When a user successfully resets their password, all existing refresh tokens for that user MUST be revoked immediately.
