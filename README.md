# GTMS — Recruiting & Employee Pay Platform

A **recruiting and payroll platform**. People apply for an account, an
administrator (HR) onboards them as an employee — setting their job title,
department, and salary — and then pays them manually from the admin console.
Employees see their pay history in a wallet and withdraw their earnings.

## Core principle (anti-fraud guardrails)

Money flows in **one direction only: company → employee.**

- **Employees never deposit.** An employee wallet can only be *credited* (salary
  payments) and *debited* (withdrawals). "Add funds" is blocked for employees at
  the RBAC, service, and UI layers — there is no path for an employee to pay in.
- **No fees to get hired or paid.** Applying, onboarding, and withdrawing are
  always free. No tiers, no balance freezing, no pay-to-withdraw.
- **Salaries are paid by the company**, from the company/system wallet, via
  explicit admin action — never funded by anyone's deposit.

These are enforced in code — see `postTransaction()` in
[`src/server/services/wallet.service.ts`](src/server/services/wallet.service.ts),
which rejects deposit-type transactions against an employee wallet, and
`paySalary()` in
[`src/server/services/payroll.service.ts`](src/server/services/payroll.service.ts).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Prisma + Postgres ·
Tailwind CSS · Auth.js (NextAuth v5). Money is tracked as integer cents in an
append-only double-entry ledger behind a `PaymentProvider` abstraction
(simulated now; Stripe Connect drop-in later).

## Getting started

1. **Create a hosted Postgres DB** (Neon or Supabase, free tier) and copy the
   connection string.
2. **Configure env:**
   ```bash
   cp .env.example .env
   # set DATABASE_URL, then generate an auth secret:
   npx auth secret    # writes AUTH_SECRET, or set it manually
   ```
3. **Install, migrate, seed:**
   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. **Run:**
   ```bash
   npm run dev    # http://localhost:3000
   ```

### Seeded accounts

| Role              | Email                 | Password        |
| ----------------- | --------------------- | --------------- |
| Admin / HR        | admin@gtms.local      | admin12345      |
| Employee (active) | employee@gtms.local   | employee12345   |
| Applicant         | prospect@gtms.local   | prospect12345   |

The active employee is onboarded with a $2,000 salary and pre-approved KYC.
The applicant is registered but not yet onboarded (shows up to onboard).

## Happy-path demo

1. Sign in as **admin** → `/admin/employees`. In **Onboard a new employee**,
   pick "Percy Prospect", set a job title and salary → **Onboard**.
2. Still on `/admin/employees`, type an amount next to an employee and **Pay** —
   their wallet is credited from the company wallet.
3. Sign in as the **employee** → **Dashboard** shows the payment and salary;
   **Pay & wallet** → **Withdraw** requests a payout.
4. As **admin** → `/admin/ledger` shows every wallet reconciles;
   `/admin/payouts` processes the employee's withdrawal.

## Payments

Set `PAYMENT_PROVIDER=simulated` (default) for in-DB fake money, or implement
[`src/server/payments/stripe.provider.ts`](src/server/payments/stripe.provider.ts)
and set `PAYMENT_PROVIDER=stripe` to go live — no business logic changes needed.

## Scheduled jobs

`/api/cron/expire-reservations` and `/api/cron/auto-approve` (see `vercel.json`),
protected by `CRON_SECRET`.
