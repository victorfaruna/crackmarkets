# AGENTS.md — Track Markets Engineering Guidelines & System Specification

Welcome to **Track Markets**. This document is the single source of truth for the domain specifications, technical architecture, theme standards, and agent behavior in this codebase.

---

## 1. Project Overview & Architecture

- **Domain**: Track Markets — Advanced Service Provider & 10-Level Referral Management System integrated with RoboForex trading APIs.
- **Frontend Stack**: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, DaisyUI.
- **State & Data Layer**: Zustand stores (`src/lib/stores/`), Axios (`src/lib/services/api.ts`), TanStack React Query.
- **Font Stack**: Clash Display (`font-clash-display`), Satoshi (`font-satoshi`), Roobert (`font-roobert`), Rubik (`font-rubik`), Montserrat (`font-montserrat`), Geist Sans (`font-geist`).
- **Core Principle**: Broker data is the source of truth for deposits, trades, lots, and trading volume. The platform database is the source of truth for referral relationships, commission calculations, qualifications, wallets, withdrawals, and rewards.

---

## 2. Strict Theme & Styling Rules (Zero Hardcoded Colors)

### The Golden Rule
> **NEVER use hardcoded color values** (e.g., `text-white`, `text-[#000]`, `bg-sky-400`, `bg-[#222222]`, `text-gray-400`, `text-red-500`, `text-green-600`, etc.). All components MUST use the semantic CSS variables defined in `src/app/globals.css`.

### CSS Variable Mapping

| Semantic Role | Theme Token | Tailwind Utility Classes | Example Usage |
| :--- | :--- | :--- | :--- |
| **App Background** | `--background` | `bg-background`, `text-background` | Root canvas & page background |
| **Card / Primary Layer** | `--primary` | `bg-primary`, `text-primary`, `bg-primary/20`, `bg-primary/50` | Input fields, cards, modal sheets |
| **Main Text / Contrast** | `--secondary` | `text-secondary`, `bg-secondary`, `border-secondary/15` | Headings, body copy, standard borders |
| **Muted Text / Subtext** | `--subtext` | `text-subtext`, `border-subtext/30` | Placeholders, captions, disabled states |
| **Primary Accent / CTA** | `--accent` | `bg-accent`, `text-accent`, `hover:bg-accent/90`, `focus:border-accent`, `accent-accent` | Primary action buttons, active tabs, focus rings |
| **Error / Destructive** | `--error` | `text-error`, `bg-error/10`, `border-error/20` | Form validation errors, danger alerts |
| **Success / Status** | `--success` | `text-success`, `bg-success`, `bg-success/10`, `border-success/20` | Badges, success alerts, verification icons |

### Color Hierarchy with Opacity Fractions
- `text-secondary/90` — High emphasis text
- `text-secondary/80` — Primary body copy
- `text-secondary/60` — Secondary descriptive copy
- `text-secondary/40` — Placeholders & disabled text
- `bg-primary/20` to `bg-primary/80` — Layered containers & inputs
- `border-secondary/10` to `border-secondary/20` — Subtle dividers & borders

---

## 3. Scope & Behavioral Precision

1. **Strict Scope Adherence**: Only modify code, styles, and files directly requested by the user.
2. **Typography Preservation**: Do NOT modify font families, font sizes, heading weights, or existing panel structures unless explicitly instructed.
3. **No Collateral Layout Shifts**: Preserve existing template layouts (such as the left hero mesh panel on auth screens and existing dashboard drawer patterns).
4. **Mandatory Architecture Sync**: Whenever architectural, schema, state management, API service, or system flow changes are made, the agent MUST immediately update `AGENTS.md` to reflect the changes. `AGENTS.md` is the living single source of truth and must always stay synchronized with the active codebase.

---

## 4. System Overview & Core System Flow

```
USER REGISTERS (first_name, last_name, email, phone, country, password, referral_code)
       ↓
EMAIL VERIFICATION
       ↓
REFERRAL LINK GENERATED (10-Level Tree)
       ↓
KYC SUBMISSION
       ↓
KYC APPROVED?
   ┌───┴────┐
   NO       YES
   ↓         ↓
FUNDING    FUNDING & TRADING ACTIVATED
LOCKED       ↓
       ROBOFOREX BROKER ACCOUNT LINKED
             ↓
       TRADING DATA / DEPOSITS SYNCED (API / Webhooks)
             ↓
      ┌──────┴──────┐
      ↓             ↓
 TEAM VOLUME     LOT VOLUME
      ↓             ↓
BONUS 1: REFERRAL PROFIT (5% L1 down to 1% L10)
BONUS 2: LOT DISTRIBUTION ($2.00 L1–L3 down to $0.50 L10)
      ↓             ↓
      └──────┬──────┘
             ↓
     QUALIFICATION ENGINE (BONUS 3 Strong Leg, BONUS 4 Volume Ladder 1%–8%)
             ↓
     LEADERSHIP REWARDS & POOLS (Travel, Car, Estate Grand Prize)
             ↓
     TRANSACTION LEDGER & WALLET PAYOUTS
```

---

## 5. User Registration & KYC Specifications

- **Registration Fields**: `first_name`, `last_name`, `email`, `phone_number`, `country`, `password`, `referral_code` (optional).
- **Initial User State**: `status = "EMAIL_VERIFICATION_PENDING"`, `kyc_status = "NOT_VERIFIED"`, `funding_status = "LOCKED"`.
- **KYC Statuses**: `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`.
- **Trading & Funding Gate**: A user may obtain their referral code upon email verification, but trading and funding remain locked until KYC status is `APPROVED`.

---

## 6. 10-Level Referral Tree & Commission Structure

### Bonus 1 — Team Referral Profit
Calculated on trading profit generated across 10 levels:
- **Level 1**: 5%
- **Level 2**: 4%
- **Level 3**: 3%
- **Level 4 – Level 9**: 2% each
- **Level 10**: 1%

### Bonus 2 — Lot Distribution
Calculated per traded lot generated across the organization:
- **Level 1 – Level 3**: $2.00 / lot
- **Level 4**: $1.00 / lot
- **Level 5 – Level 10**: $0.50 / lot

### Bonus 3 — Team Trading Volume Bonus (Strong Leg Rule)
- **Tier 1**: Total Team Volume $\ge$ $500,000 with Strong Leg $\ge$ $250,000 $\rightarrow$ Bonus = Strong Leg Lots $\times$ $1.
- **Tier 2**: Total Team Volume $\ge$ $1,000,000 with Strong Leg $\ge$ $500,000 (50%) $\rightarrow$ Bonus = Strong Leg Lots $\times$ $1.

### Bonus 4 — Percentage Level Bonus Ladder
- Level 1: $10,000 volume $\rightarrow$ 1%
- Level 2: $50,000 volume $\rightarrow$ 2%
- Level 3: $200,000 volume $\rightarrow$ 3.5%
- Level 4: $1,000,000 volume $\rightarrow$ 5%
- Level 5: $3,500,000 volume $\rightarrow$ 5.5%
- Level 6: $8,000,000 volume $\rightarrow$ 6%
- Level 7: $15,000,000 volume $\rightarrow$ 6.5%
- Level 8: $30,000,000 volume $\rightarrow$ 7%
- Level 9: $50,000,000 volume $\rightarrow$ 8%

### Bonus 5 — Leadership Rewards & Pools
- **Travel Benefit**: Maintain $\$50,000$ monthly team deposits for 3 consecutive months $\rightarrow$ Travel Trip or $\$2,000$ cash.
- **Leader Pool 1**: Qualify for 2 consecutive months $\rightarrow$ Family Luxury Trip ($\le \$15,000$).
- **Leader Pool 2**: Qualify for 2 consecutive months $\rightarrow$ Car ($\le \$25,000$).
- **Grand Prize**: Maintain qualification for up to 6 months $\rightarrow$ Estate ($\le \$1,200,000$).

---

## 7. Database & Drizzle ORM Architecture

- **ORM**: Drizzle ORM (`drizzle-orm`) with PostgreSQL driver (`postgres`). Config in `drizzle.config.ts`, DB client in `src/lib/db/index.ts`.
- **Database Schema Models (`src/lib/db/schema/`)**:
  - `users`: `id`, `first_name`, `last_name`, `email` (unique), `phone_number`, `country`, `telegram_handle`, `password_hash`, `referral_code` (unique), `referred_by_id`, `status`, `kyc_status`, `funding_status`, `role`, `created_at`, `updated_at`.
  - `refresh_tokens`: `id`, `user_id`, `token_hash` (unique), `user_agent`, `ip_address`, `expires_at`, `revoked_at`, `created_at`.
  - `email_verification_tokens`: `id`, `user_id`, `token_hash` (unique), `expires_at`, `created_at`.
  - `password_reset_tokens`: `id`, `user_id`, `token_hash` (unique), `expires_at`, `used_at`, `created_at`.
  - `audit_logs`: `id`, `user_id`, `action`, `ip_address`, `user_agent`, `details` (jsonb), `created_at`.
  - `referral_nodes`: Lineage closure table (`ancestor_id`, `descendant_id`, `depth` 1–10) created atomically upon registration.
  - `wallets`: `id`, `user_id` (unique), `balance`, `available_balance`, `total_withdrawn`, `lifetime_earnings`.
  - `transactions`: `id`, `user_id`, `source_user_id`, `amount`, `transaction_type`, `reference_id`, `level`, `status`, `created_at`.
  - `events`: `id`, `title`, `category`, `description`, `reward_pool`, `location`, `starts_at`, `ends_at`, `status`, `created_by`, `created_at`, `updated_at`.

---

## 8. Authentication & Next.js API Routes

- **Session Strategy**: Dual-token architecture with HTTP-only cookies (`access_token` 15m JWT + `refresh_token` 7d rotated hash).
- **Proactive Middleware**: `src/middleware.ts` seamlessly refreshes tokens when expired using `/api/auth/refresh`.
- **API Route Endpoints (`src/app/api/auth/`)**:
  - `POST /api/auth/register`: Account creation, wallet initialization, 10-level tree attribution, token issuance.
  - `POST /api/auth/login`: Credential validation, refresh token storage, HTTP-only cookie attachment.
  - `POST /api/auth/refresh`: Token rotation (revokes old token, issues new pair).
  - `POST /api/auth/logout`: Revokes active refresh token and clears cookies.
  - `GET /api/auth/me`: Authenticated profile and wallet summary query.
  - `POST /api/auth/verify-email`: Token validation, activates user (`status = "ACTIVE"`).
  - `POST /api/auth/forgot-password`: Generates reset token & sends recovery instructions.
  - `POST /api/auth/reset-password`: Validates token, updates password, revokes active sessions.
  - `GET /api/events`: Query events with category, status, date, and month calendar filters.
  - `GET /api/events/:id`: Retrieve single event details.

---

## 9. Dashboard Views & Architecture

The Track Markets Dashboard uses a collapsible drawer with grouped navigation sections:

**Drawer Structure:**
```
Overview                   /dashboard                 (flat, gated by RoboForex)
Profile                    /dashboard/profile          (flat, always visible)
Wallet                     [triggers withdrawal sheet] (flat, always visible)
Events                     /dashboard/events           (flat, always visible)
─────────
▸ My Network              [collapsible, always visible]
    Network                /dashboard/network
    My Global Affiliates   /dashboard/network?view=global
    My Top Affiliates      /dashboard/network?view=top
▸ My Commissions          [collapsible, gated by RoboForex]
    Commissions            /dashboard/commissions
    Rewards & Incentives   /dashboard/rewards
▸ Trading                 [collapsible, gated by RoboForex]
    Trading Analytics      /dashboard/trading
```

**Dashboard Views:**

1. **Overview (`/dashboard`)**: Financial balances, broker & trading card, 10-level referral overview, qualification progress, leadership rewards tracker, recent commission ledger.

2. **10-Level Network Lineage System (`/dashboard/network`)**:
   - **Overview Metrics**: Real-time counter cards for Direct Affiliates (Level 1: 5%), Indirect Affiliates (Levels 2–10), and Total Organization.
   - **System View Tabs**:
     - **Lineage Tree**: Clean visual hierarchy connecting root user to direct referrals and downlines with expandable child nodes.
     - **Directs (L1)**: Filtered table focusing strictly on Level 1 direct affiliates with 5% profit share, status, and joined dates.
     - **Total Network**: Full 10-level searchable member directory with multi-tier filter pills (`All`, `Level 1` through `Level 10`).
     - **Tier Breakdown**: Summary grid of all 10 commission tiers (percentages, lot bonuses, and member counts).

3. **Trading Analytics (`/dashboard/trading`)**: Lot volume history, open trade positions, floating P/L, broker sync timestamps.

4. **Commission Ledger (`/dashboard/commissions`)**: Full transaction history across all 5 bonuses (Referral Profit, Lot Bonus, Strong Leg Bonus, Ladder Tier Bonus, Leadership Pools) and wallet payout withdrawals.

5. **Leadership Pools & Rewards (`/dashboard/rewards`)**: Milestone streak progress bars for Travel Benefit, Vacation Pool, Car Pool, and Grand Prize Estate.

6. **KYC & Broker Account Link (`/dashboard/kyc`)**: KYC verification timeline, document upload workflow, and broker account link management.

7. **Trader Settings (`/dashboard/settings`)**: Profile summary, password change, and security settings.

8. **Trader Profile (`/dashboard/profile`)**:
   - **Personal Information Card**: Dynamic profile avatar, full name, account badges (Partner, Referral ID, RoboForex ID, Joined date, Referrer status), contact & identity grid (Birthday, Email, Phone, Telegram, Country, Living Address), and interactive privacy & notification switches.
   - **Partner Referral QR Card**: Live QR code generator with avatar inlay, custom link copy, and native share.
   - **Platform Integration Cards**: RoboForex, FOXAi, and BIX Wallets integration cards.

9. **Notifications (`/dashboard/notifications`)**: Centralized notifications center for commissions, network events, security milestones, and system notices with category filtering and mark-as-read workflows.

10. **Events & Competitions (`/dashboard/events`)**:
    - **Interactive Month Calendar**: Visual calendar widget with month navigation, day selector, category indicator dots, and legend (`Trading Contest`, `Webinar`, `Summit`, `Leadership Pool`).
    - **Live Events Feed**: Database-backed event cards with category badge styling, dynamic countdown timers (`🔥 X Days, Y Hours`), `.ics` iCal download, Google Calendar integration, and accordion detail views.

---

## 10. Development & Verification Workflows

```bash
# Start development server
yarn dev

# Run TypeScript & linting checks
yarn lint

# Build production bundle
yarn build

# Drizzle ORM commands
yarn db:generate
yarn db:migrate
yarn db:push
yarn db:studio
```

---

## 11. Environment Variables Specification

Configured in `.env.local` (local development) and `.env.example` (template):

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/crackmarkets` | Yes |
| `JWT_SECRET` | 32+ char secret for JWT HS256 tokens | `crackmarkets-super-secure-jwt-secret-key-32chars!` | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret fallback | `crackmarkets-super-secure-nextauth-secret-key-32chars!` | No |
| `NEXTAUTH_URL` | Application root URL for NextAuth | `http://localhost:3000` | No |
| `NEXT_PUBLIC_APP_URL`| Application public URL | `http://localhost:3000` | No |
| `NEXT_PUBLIC_API_URL`| Custom backend API URL prefix | `/api` | No |
| `NODE_ENV` | Environment mode | `development` / `production` | Yes |

---

## 12. Mandatory Security Standards (Server & Client)

All development MUST adhere to the security rules specified in `.agents/rules/security.md`:

### Server Security
1. **Zero-Trust Validation**: Every API route and server action must validate payloads using strict Zod schemas (`z.object({...}).strict()`).
2. **Authentication & Authorization**: Verify JWT session and resource ownership (`WHERE user_id = session.userId`) on every request to prevent IDOR.
3. **Sensitive Data Protection**: Passwords must be hashed with `bcryptjs` (cost factor 12). Tokens must be hashed with SHA-256 in the database. Never leak `password_hash`, `token_hash`, or internal secrets in API responses.
4. **Cookie Security**: Auth cookies MUST use `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, and `sameSite: "lax"`.
5. **Database Safety**: Use Drizzle ORM parameterized queries and transactional atomicity (`db.transaction(...)`) for multi-table updates.
6. **Error Sanitization**: Never return raw database errors, SQL statements, or stack traces to clients. Log errors internally with structured context.
7. **Audit Trail**: Record key security and financial events (`USER_REGISTER`, `USER_LOGIN`, `USER_LOGOUT`, `PASSWORD_RESET`, etc.) in `audit_logs`.

### Client Security
1. **No Token Storage in Web Storage**: Never store JWTs, refresh tokens, or secrets in `localStorage`, `sessionStorage`, or window global variables.
2. **XSS Protection**: Rely on React's automatic string escaping; avoid `dangerouslySetInnerHTML`. Validate external URLs before rendering links.
3. **Environment Security**: Never prefix secrets with `NEXT_PUBLIC_`. Keep private API keys strictly on the server.
4. **Client Validation is UX Only**: Always treat client-side validation as untrusted and enforce authoritative validation on the server.
5. **Bot Protection**: Enforce Cloudflare Turnstile on public and authentication forms.


