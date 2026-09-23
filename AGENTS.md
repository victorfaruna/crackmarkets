# AGENTS.md — Trackmarkets Engineering Guidelines & System Specification

Welcome to **Trackmarkets**. This document is the single source of truth for the domain specifications, technical architecture, theme standards, and agent behavior in this codebase.

---

## 1. Project Overview & Architecture

- **Domain**: Trackmarkets — Advanced Service Provider & 10-Level Referral Management System integrated with RoboForex trading APIs.
- **Frontend Stack**: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, DaisyUI.
- **State & Data Layer**: Zustand stores (`src/lib/stores/`), Axios (`src/lib/services/api.ts`), TanStack React Query.
- **Theme State**: `useAppStore` is the source of truth for `light`/`dark`, with `light` as the default. Its persisted Zustand value is applied to `<html data-theme>` by a pre-hydration bootstrap in the root layout, then kept synchronized by the store setter and `ThemeHydrator`.
- **Font Stack**: Inter (`font-inter`) is the sole application font for body copy, headings, labels, metrics, and interface text.
- **Core Principle**: Broker data is the source of truth for deposits, trades, lots, and trading volume. The platform database is the source of truth for referral relationships, commission calculations, qualifications, wallets, withdrawals, and rewards.
- **Calculation Boundary**: `src/lib/commissions/calculations.ts` contains pure, four-decimal fixed-point rules for 10-level profit share and lot rebates, strong-leg qualification, and volume-ladder tiers. It does not credit wallets or generate trading data. Commission posting requires an authoritative verified broker event and a separate idempotent ledger workflow, which is not yet integrated.
- **Referral Lineage Model**: `users.referred_by_id` is the authoritative direct-parent relationship. Registration creates its 10-level closure links from this parent chain; network, overview, and impression counts traverse it through `src/lib/referrals/lineage.ts`. Legacy `referral_nodes` rows may be stale and must be reconciled before a commission-posting workflow uses them.
- **Binary Placement Model**: `binary_placements` is a separate presentation hierarchy; it never changes `users.referred_by_id` or commission levels. Each non-root user occupies one Left or Right position, and a unique `(parent_user_id, side)` index limits every position to two children. Registration finds the referrer's sponsorship root, locks placement allocation, and fills the earliest open slot breadth first (Left before Right). Referrals without a code start a new tree. Migration `0002` assigns existing referred users stable positions in registration order within each sponsorship root's tree. A user's placement descendants can differ from their sponsored referral descendants.
- **Binary Migration Gate**: Apply `drizzle/0002_faithful_metal_master.sql` through `yarn db:migrate` before deploying the binary placement registration and network endpoints. The migration backfills existing positions and fails if referral parent cycles prevent a complete assignment; it is never run from a request.
- **Legacy Data Repair**: Reviewed one-time scripts in `scripts/repair-referral-lineage.sql` and `scripts/backfill-wallets.sql` reconcile stale closure rows and create missing zero-balance wallets. They are not run automatically on requests or deployment.

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
| **Text on Fixed Dark Surfaces** | `--on-dark` | `text-on-dark`, `text-on-dark/80` | Light text that remains readable on intentionally dark cards in either theme |
| **Muted Text / Subtext** | `--subtext` | `text-subtext`, `border-subtext/30` | Placeholders, captions, disabled states |
| **Primary Accent / CTA** | `--accent` | `bg-accent`, `text-accent`, `hover:bg-accent/90`, `focus:border-accent`, `accent-accent` | Primary action buttons, active tabs, focus rings |
| **Error / Destructive** | `--error` | `text-error`, `bg-error/10`, `border-error/20` | Form validation errors, danger alerts |
| **Success / Status** | `--success` | `text-success`, `bg-success`, `bg-success/10`, `border-success/20` | Badges, success alerts, verification icons |
| **Brand Chrome** | `--shell-background` | `bg-shell-background` | Fixed dark green dashboard chrome and login/signup hero in both themes |
| **Dashboard Chrome Layer** | `--shell-surface` | `bg-shell-surface` | Active navigation and decorative drawer surfaces |
| **Dashboard Brand Green** | `--shell-accent` | `text-shell-accent`, `bg-shell-accent` | Dashboard wordmark, active indicator, and decorative market graphic |
| **Authentication CTA** | `--auth-action` | `bg-auth-action`, `border-auth-action` | Green login/signup submit buttons and active tab underline; form focus, links, and checked controls continue to use the global `--accent` token |

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
ACCOUNT ACTIVATED (email verification temporarily disabled)
       ↓
REFERRAL LINK GENERATED (10-Level Tree)
       ↓
BINARY TREE STARTED OR POSITION ASSIGNED (Left / Right, breadth first)
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
- **Initial User State**: `status = "ACTIVE"`, `kyc_status = "NOT_SUBMITTED"`, `funding_status = "LOCKED"`. Email verification is temporarily disabled; existing `EMAIL_VERIFICATION_PENDING` accounts are activated after a valid password login.
- **KYC Statuses**: `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`.
- **Trading & Funding Gate**: A user receives their referral code at registration, but trading and funding remain locked until KYC status is `APPROVED`. A valid referral code records the sponsor and assigns the next available binary position atomically; no referral code starts a new binary root.

---

## 6. 10-Level Referral Lineage & Commission Structure

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
- **Calculation Runtime**: TypeScript targets ES2020 so commission rules and ledger summaries can use `bigint` fixed-point arithmetic without binary floating-point rounding. Incremental type checking is disabled to keep project checks reliable after target changes. `yarn verify` includes the pure commission-rule tests.
- **Database Schema Models (`src/lib/db/schema/`)**:
  - `users`: `id`, `first_name`, `last_name`, `email` (unique), `phone_number`, `country`, `telegram_handle`, `password_hash`, `referral_code` (unique), `referred_by_id`, `status`, `kyc_status`, `funding_status`, `role`, `created_at`, `updated_at`.
  - `refresh_tokens`: `id`, `user_id`, `token_hash` (unique), `user_agent`, `ip_address`, `expires_at`, `revoked_at`, `created_at`.
  - `email_verification_tokens`: `id`, `user_id`, `token_hash` (unique), `expires_at`, `created_at`.
  - `password_reset_tokens`: `id`, `user_id`, `token_hash` (unique), `expires_at`, `used_at`, `created_at`.
  - `audit_logs`: `id`, `user_id`, `action`, `ip_address`, `user_agent`, `details` (jsonb), `created_at`.
  - `referral_nodes`: Lineage closure table (`ancestor_id`, `descendant_id`, `depth` 1–10) created atomically upon registration.
  - `binary_placements`: Separate visual tree (`user_id`, `parent_user_id`, `side` Left/Right). One row per referred user, unique parent/side, no row for an unreferenced root. It does not determine commission attribution.
  - `wallets`: `id`, `user_id` (unique), `balance`, `available_balance`, `total_withdrawn`, `lifetime_earnings`.
  - `transactions`: `id`, `user_id`, `source_user_id`, `amount`, `transaction_type`, `reference_id`, `level`, `status`, `idempotency_key`, `metadata`, `created_at`.
  - `api_rate_limits`: database-backed fixed-window counters for public authentication and referral-impression endpoints.
  - `events`: `id`, `title`, `category`, `description`, `reward_pool`, `location`, `starts_at`, `ends_at`, `status`, `created_by`, `created_at`, `updated_at`.

---

## 8. Authentication & Next.js API Routes

- **Login & Signup Presentation**: `/login` and `/register` share `AuthEntryLayout`, a responsive two-column screen with the generated decorative bull-and-phone hero and supporting copy on the left and a constrained account form on the right. Existing credential validation, referral attribution, country selection, risk acknowledgments, and Turnstile behavior are retained. Recovery and verification pages continue to use `AuthLayout`.
- **Terms of Service**: `/terms` is a public, section-indexed page showing the user-supplied 40-section Terms of Service and risk notice. Registration links to it without adding a new consent gate; the supplied contact placeholders remain until official details are provided.
- **Customer Landing**: Successful customer login always opens `/dashboard/profile`, whether or not a RoboForex account is linked. Authenticated customers revisiting public auth pages, `/`, or `/onboard` also land on the profile. Administrator authentication continues to open `/admin`.
- **Session Strategy**: Dual-token architecture with HTTP-only cookies. Customer access JWTs last 15 minutes. Customer refresh tokens rotate on use and last 14 inactive days when “Remember this device” is checked (the login default). Unchecking it issues browser-session cookies backed by a rotating refresh token with a 7-day server expiry. Existing unprefixed customer refresh tokens adopt the 14-day policy on rotation; logout and revocation still end sessions. The refresh token's `session_` prefix preserves the browser-session choice across rotations and is validated through the stored SHA-256 hash.
- **Admin Session Strategy**: `/admin` uses an isolated admin-scoped JWT and cookie pair (`admin_access_token` + `admin_refresh_token`). Admin login accepts only active `ADMIN` users, rotates persisted refresh tokens on a separate 7-day policy, and never reuses the customer dashboard session.
- **Proactive Proxy**: `src/proxy.ts` refreshes expired customer tokens using `/api/auth/refresh` and forwards rotated cookies when redirecting authenticated customers from public auth pages to their profile.
- **API Route Endpoints (`src/app/api/auth/`)**:
  - `POST /api/auth/register`: Immediate account activation, wallet initialization, 10-level sponsorship attribution, and atomic Left/Right placement under the referrer's root while email verification is disabled.
  - `POST /api/auth/login`: Credential validation, refresh token storage, HTTP-only cookie attachment.
  - `POST /api/auth/refresh`: Token rotation (revokes old token, issues new pair).
  - `POST /api/auth/logout`: Revokes active refresh token and clears cookies.
  - `GET /api/auth/me`: Authenticated profile and wallet summary query.
  - `POST /api/auth/verify-email`: Retained for restoring email verification later; registration does not currently issue verification tokens.
  - `POST /api/auth/forgot-password`: Generates reset token & sends recovery instructions.
  - `POST /api/auth/reset-password`: Validates token, updates password, revokes active sessions.
  - `GET /api/wallet/transactions`: Query user transactions with category, status, and search filters.
  - `POST /api/wallet/withdraw`: Validate account/KYC/funding/broker state, serialize retries by idempotency key, atomically reserve available balance once, and create a `PENDING` withdrawal request. Completion requires a separately verified payout integration.
  - `GET /api/commissions`: Read completed ledger credits only, filter by trailing week, selected UTC month, or all time; classify leadership rewards by metadata when available, leaving unknown categories unclassified.
  - `GET /api/network`: Traverse direct-parent relationships to return the full 10-level referral lineage and exact direct and indirect counts without a 100-member truncation. Separately return the authenticated user's binary placement descendants with only the minimal names and position metadata needed for the tree; never synthesize trading volume.
  - `GET /api/events`, `GET /api/events/:id`: Return date-derived event status so stale stored `UPCOMING` flags do not present completed events as live. Date and month filters use half-open ranges adjusted by the client's UTC offset, and include events overlapping the chosen period.
  - `POST /api/admin/auth/login`, `POST /api/admin/auth/refresh`, `POST /api/admin/auth/logout`: Isolated administrator authentication with stricter login rate limiting and audited session activity.
  - `PATCH /api/admin/users/:id`: Admin-only, strictly validated role (`USER`/`SUPPORT`), account, KYC, and funding state changes. Funding unlocks require approved KYC, moving KYC out of approved automatically locks funding, suspensions revoke active sessions, and every change is audited.
  - `DELETE /api/admin/users/:id/sessions`: Revoke every active customer refresh session and record the administrator action.
  - `DELETE /api/admin/users/:id/broker`: Unlink a customer's RoboForex account, clear its broker identifier, lock funding, and record the administrator action.
  - `PATCH /api/admin/withdrawals/:id`: Reverse a `PENDING` withdrawal with a required reason, atomically return its reserved amount to the user's available balance, and record the administrator action. Withdrawal completion remains unavailable until a verified payout integration exists.

### Administrator Console

- **Route**: `/admin` (login at `/admin/login`), protected independently from `/dashboard`.
- **Dashboard**: Responsive operations workspace with live totals for users, active accounts, KYC, broker links, withdrawals, and wallet balances; a pending-withdrawal queue; the 100 newest non-admin accounts; and recent administrator audit activity.
- **Actions**: Search and filter users; assign `USER` or `SUPPORT` roles; update account, KYC, and funding states; revoke customer sessions; unlink broker accounts; and reverse pending withdrawals to return reserved funds. Admin accounts cannot be modified through the user-management table.
- **Provisioning**: Promote an existing registered account with `yarn admin:promote admin@example.com`; the role grant is recorded in `audit_logs`.

---

## 9. Dashboard Views & Architecture

The Trackmarkets Dashboard uses a collapsible drawer with grouped navigation sections:

On screens below the `lg` breakpoint, the existing drawer opens over the page from the header menu button. It closes after selecting a link, tapping the backdrop, pressing Escape, or resizing to desktop width. At `lg` and above, the drawer remains in its desktop position.

**Drawer Structure:**
```
Overview                   /dashboard                 (flat, gated by RoboForex)
Profile                    /dashboard/profile          (flat, always visible)
Wallet                     /dashboard/wallet           (flat, gated by RoboForex)
Events                     /dashboard/events           (flat, gated by RoboForex)
─────────
▸ My Network              [collapsible, always visible]
    Network                /dashboard/network
    My Global Affiliates   /dashboard/network?view=global
    My Top Affiliates      /dashboard/network?view=top
▸ My Commissions          [collapsible, gated by RoboForex]
    Commissions            /dashboard/commissions
    Rewards & Incentives   /dashboard/rewards
▸ Analytics               [collapsible, gated by RoboForex]
    Trading Analytics      /dashboard/analytics
```

**Dashboard Views:**

1. **Overview (`/dashboard`)**: Financial balances, broker & trading card, 10-level referral overview, qualification progress, leadership rewards tracker, recent commission ledger.

2. **Wallet & Transaction History (`/dashboard/wallet`)**:
   - **Wallet Balance Card**: Available commission balance ($XX,XXX.XX USDT), lifetime earnings, total withdrawn, instant settlement badge, and direct withdrawal modal launcher.
   - **Payout Metrics**: Supported crypto networks (TRC20, BEP20, ERC20), instant processing timelines, and withdrawal status indicators.
   - **Live Transaction Ledger**: Searchable & filterable table of all 5 commission bonus distributions, crypto withdrawals, and deposit syncs with reference IDs, status pills, timestamps, and quick-copy action buttons.
   - **Reversed Withdrawals**: A reversed request is labelled as reserved funds returned and keeps its `REVERSED` status; it is not displayed as a completed payout or a fresh commission credit.

3. **10-Level Network Lineage System (`/dashboard/network`)**:
   - **Overview Metrics**: Real-time counter cards for Direct Affiliates (Level 1: 5%), Indirect Affiliates (Levels 2–10), and Total Organization.
   - **System View Tabs**:
   - **Binary Tree**: Root user at Level 0, two Left/Right positions per occupied node, and breadth-first levels of 1, 2, 4, 8, and onward. The tree uses persisted binary placement data and renders cards and connectors only for occupied positions. Each square card shows the member name, side, immediate direct count, and all deeper indirect descendants; users can focus a branch to explore deeper levels. The tree is a pannable and zoomable canvas on desktop and mobile, with drag, wheel or pinch zoom, and zoom, fit, and reset controls. Broker volume is omitted until authoritative data exists. The Direct Referrals and Total Network tabs still use the separate sponsorship lineage for 10-level commission tiers.
     - **Directs (L1)**: Filtered table focusing strictly on Level 1 direct affiliates with 5% profit share, status, and joined dates.
     - **Total Network**: Full 10-level searchable member directory with multi-tier filter pills (`All`, `Level 1` through `Level 10`).
     - **Tier Breakdown**: Summary grid of all 10 commission tiers (percentages, lot bonuses, and member counts).

4. **Trading Analytics (`/dashboard/analytics`)**: Live RoboForex account equity and floating P/L cards, open positions table with symbol, execution type, volume, and floating profit/loss, margin utilization, and broker connection status.

5. **My Commissions Overview (`/dashboard/commissions`)**:
   - **Monthly Preview Cards**: 3 top metric cards: Profit Share (Weekly Preview, Bonus 1: 5%–1%), LOT Commission (Weekly Preview, Bonus 2: $2.00–$0.50/lot), and Volume & Pools (Monthly Preview, Bonus 3, 4 & 5).
   - **My Different Income Streams**: Distribution grid across all 8 revenue streams (Lot Commissions, Profit Share, Strong Leg Volume, Percentage Ladder, Leader Pool 1, Leader Pool 2, Grand Estate Prize, Travel Benefit) with counts, amounts, percentages, and CSV download report export.
   - **Recent Commission Distributions**: Live searchable table of all recent commission credits from downline trades.

6. **Leadership Pools & Rewards (`/dashboard/rewards`)**: Milestone streak progress bars for Travel Benefit ($2,000 / Trip), Leader Pool 1 ($15,000 Family Luxury Trip), Leader Pool 2 ($25,000 Luxury Car), and Grand Prize Estate ($1,200,000), Strong Leg bonus rule cards (Bonus 3), and 9-tier volume percentage ladder grid (Bonus 4).

7. **KYC & Broker Account Link (`/dashboard/kyc`)**: KYC status and broker account link management. Document submission remains disabled until a verified KYC provider is configured; the UI must not simulate approval or submission.

8. **Trader Settings (`/dashboard/settings`)**: Profile summary, password change, and security settings.

9. **Trader Profile (`/dashboard/profile`)**:
   - **Personal Information Card**: Dynamic profile avatar with an inline icon fallback when the avatar service is unavailable, full name, account badges (Partner, Referral ID, RoboForex ID, Joined date, Referrer status), contact & identity grid (Birthday, Email, Phone, Telegram, Country, Living Address), and interactive privacy & notification switches.
   - **Partner Referral QR Card**: Live QR code generator with avatar inlay, custom link copy, and native share.
   - **Platform Integration Cards**: RoboForex, FoxAlgo, and BIX Wallets integration cards. RoboForex actions use the `lazwx` master referral URL. Both FoxAlgo entry points show the trading-choice notice and require its checkbox before opening the copy-trading profile for account `77030815`.

10. **Notifications (`/dashboard/notifications`)**: Centralized notifications center for commissions, network events, security milestones, and system notices with category filtering and mark-as-read workflows.

11. **Events & Competitions (`/dashboard/events`)**:
    - **Interactive Month Calendar**: Visual calendar widget with month navigation, day selector, category indicator dots, and legend (`Trading Contest`, `Webinar`, `Summit`, `Leadership Pool`).
    - **Live Events Feed**: Database-backed event cards with category badge styling, dynamic countdown timers (`🔥 X Days, Y Hours`), `.ics` iCal download, Google Calendar integration, and accordion detail views.

---

## 10. Development & Verification Workflows

```bash
# Start development server
yarn dev

# Run TypeScript & linting checks
yarn lint

# Run lint, typecheck, commission rules, and binary tree checks
yarn verify

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

Configured in the git-ignored `.env` file (with optional `.env.local` overrides):

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/trackmarkets` | Yes |
| `JWT_SECRET` | Unique 32+ character secret for JWT HS256 tokens; application startup fails when absent | generated secret | Yes |
| `NEXT_PUBLIC_APP_URL`| Application public URL | `http://localhost:3000` | No |
| `NEXT_PUBLIC_API_URL`| Custom backend API URL prefix | `/api` | No |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key | Cloudflare-issued key | Production |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server verification secret | Cloudflare-issued secret | Production |
| `TURNSTILE_ENABLED` | Server-side Turnstile enforcement feature flag | `false` temporarily; set to `true` when Turnstile keys are configured | Yes |
| `RESEND_API_KEY` | Private API key used for verification and password-reset email delivery | Provider-issued secret | Production |
| `EMAIL_FROM` | Verified sender identity for transactional security email | `Trackmarkets <security@example.com>` | Production |
| `ROBOFOREX_ACCOUNT_VERIFY_URL` | Server endpoint used to verify account ownership | Provider endpoint | Broker linking |
| `ROBOFOREX_API_KEY` | Private credential for broker-account verification | Provider-issued secret | Broker linking |
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
5. **Bot Protection**: Cloudflare Turnstile enforcement is controlled by `TURNSTILE_ENABLED`. It is temporarily disabled and must be enabled for production once valid keys are configured.

### Financial Data Integrity
1. Broker-derived balances, equity, positions, deposits, lots, and trading volume must never be synthesized or inferred from referral-member counts.
2. When no authoritative broker sync exists, APIs and screens must return an explicit unavailable state and zero persisted values rather than demonstration figures.
3. Withdrawal creation reserves funds atomically, uses a client idempotency key, records destination metadata and an audit event, and remains `PENDING` until externally confirmed.
