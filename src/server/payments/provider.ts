// PaymentProvider abstraction.
//
// IMPORTANT: This interface only models money crossing the platform boundary:
//   - charge(): money INTO the platform from a requester (a deposit).
//   - payout(): money OUT of the platform to a worker (a withdrawal).
//
// The in-DB ledger (Transaction / EscrowHold) is the source of truth for all
// internal movement (escrow holds, releases, earnings, fees). Swapping the
// provider therefore never touches business logic.
//
// Guardrail: there is no provider method that pulls money from a worker.
// Workers never fund anything.

export interface ChargeInput {
  userId: string;
  amountCents: number;
  idempotencyKey: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PayoutInput {
  userId: string;
  amountCents: number;
  idempotencyKey: string;
  destination?: string;
  description?: string;
}

export interface ProviderResult {
  ok: boolean;
  providerRef: string;
  raw?: unknown;
  error?: string;
}

export interface WebhookEvent {
  type: string;
  providerRef: string;
  ok: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  /** Move money INTO the platform (requester deposit). */
  charge(input: ChargeInput): Promise<ProviderResult>;
  /** Move money OUT of the platform (worker payout). */
  payout(input: PayoutInput): Promise<ProviderResult>;
  /** Optional: ensure a payee can receive funds (e.g. Stripe Connect onboarding). */
  ensurePayee?(userId: string): Promise<{ ready: boolean; onboardingUrl?: string }>;
  /** Optional: verify and parse an inbound webhook. */
  verifyWebhook?(req: Request): Promise<WebhookEvent>;
}
