// Platform economics — read from env with safe defaults.

function intEnv(key: string, fallback: number): number {
  const v = process.env[key];
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Platform fee in basis points (1000 = 10%). */
export const PLATFORM_FEE_BPS = intEnv("PLATFORM_FEE_BPS", 1000);

/** Minimum worker payout in cents ($5.00). Flat — no tiers, no unlocks. */
export const MIN_PAYOUT_CENTS = intEnv("MIN_PAYOUT_CENTS", 500);

/** Default reservation lifetime in minutes. */
export const RESERVATION_TTL_MINUTES = intEnv("RESERVATION_TTL_MINUTES", 30);

/** Max units a worker may reserve at once in a combo (batch) session. */
export const COMBO_MAX_UNITS = intEnv("COMBO_MAX_UNITS", 10);

/** Default review window in hours before auto-approval. */
export const REVIEW_WINDOW_HOURS = intEnv("REVIEW_WINDOW_HOURS", 72);

/**
 * Referral bonus in cents, paid to the referrer from the PLATFORM's own funds
 * (system wallet) when their invitee earns their first approved deliverable.
 * Never funded by anyone's deposit; never gated behind a paid tier.
 */
export const REFERRAL_BONUS_CENTS = intEnv("REFERRAL_BONUS_CENTS", 100);

/**
 * Require approved KYC before a worker can withdraw. Standard AML identity
 * check — it is free, one-time, and does not gate access to tasks or earnings,
 * only the cash-out step. Set to "0" to disable.
 */
export const REQUIRE_KYC_FOR_PAYOUT = intEnv("REQUIRE_KYC_FOR_PAYOUT", 1) === 1;

/** Email of the platform/system wallet owner (collects fees). */
export const SYSTEM_USER_EMAIL = "system@gtms.local";

export const TASK_CATEGORIES = [
  "data-labeling",
  "content-moderation",
  "survey",
  "transcription",
  "categorization",
  "general",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
