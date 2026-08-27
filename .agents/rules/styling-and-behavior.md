# Crack Markets Agent Rules

## 1. Zero Hardcoded Colors Policy
- Never use raw Tailwind or hex colors (`text-white`, `text-black`, `bg-sky-400`, `bg-[#222222]`, `text-[#000]`, etc.).
- Always use theme variables defined in `src/app/globals.css`:
  - `bg-background`
  - `bg-primary`, `text-primary`
  - `text-secondary`, `border-secondary/15`, `border-secondary/20`
  - `text-subtext`
  - `bg-accent`, `text-accent`, `focus:border-accent`
  - `text-error`, `bg-error/10`, `border-error/20`
  - `text-success`, `bg-success`, `bg-success/10`, `border-success/20`
- For subtle shades and opacity, use fractional syntax: `text-secondary/80`, `text-secondary/50`, `bg-primary/20`, etc.

## 2. Strict Scope Discipline & Architecture Sync
- Strictly follow the user's prompt. Do NOT touch, rename, re-style, or replace fonts, titles, side panels, or existing layouts outside the requested task.
- **Mandatory Architecture Sync**: Whenever architectural, schema, state management, API service, or system flow changes are made, the agent MUST immediately update `AGENTS.md` to reflect the changes.

## 3. Mandatory Security Best Practices (Server & Client)
- Follow all standards defined in `.agents/rules/security.md`.
- **Zero-Trust Input Boundary**: Validate and sanitize every request payload on the server using strict Zod schemas. Never rely on client-side validation for security.
- **Data Protection**: Never store tokens/credentials in `localStorage`/`sessionStorage`. Use HTTP-only, secure, SameSite cookies. Never return `password_hash`, `token_hash`, or internal secrets in responses.
- **Access Control & IDOR Prevention**: Verify resource ownership and role permissions on every API route handler.
- **SQL & DB Safety**: Use Drizzle ORM parameterized queries and wrap multi-step state mutations in transactions.
- **Error Hygiene**: Never expose raw SQL errors, database schemas, or stack traces to clients.

## 4. Crack Markets Domain
- Project is Crack Markets (10-level referral & RoboForex brokerage integration).
- Registration collects: `first_name`, `last_name`, `email`, `phone_number`, `country`, `password`, `referral_code`, CFD/Leverage risk checkboxes, and Cloudflare Turnstile verification.

