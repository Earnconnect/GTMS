export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 1000);
export const MIN_PAYOUT_CENTS = Number(process.env.MIN_PAYOUT_CENTS ?? 500);

// Welcome bonus — automatically credited to new WORKER accounts on registration
export const WELCOME_BONUS_CENTS = 1_000; // $10.00

// First milestone — after a new worker's 10th approved task, unlock the GTMS Pass discount
export const FIRST_MILESTONE_TASKS = 10;
export const FIRST_USER_DISCOUNT_PCT = 25; // 25% off GTMS Pass ($300 → $225)

// Executive daily milestone bonus — credited when an Executive worker hits 10 approvals in a day
export const EXECUTIVE_MILESTONE_TASKS = 10;
export const EXECUTIVE_MILESTONE_BONUS_CENTS = 500; // $5.00

// GTMS VIP Pass — one-time purchase unlocking Combination tasks
export const GTMS_PASS_CENTS = 30_000; // $300.00

// Dormancy — triggered when wallet balance hits $0; worker must deposit this amount to reactivate
export const DORMANT_REACTIVATION_CENTS = 2_000; // $20.00 (2× minimum)

export const ROLE_HOME: Record<string, string> = {
  WORKER: "/dashboard",
  BUSINESS: "/business/dashboard",
  ADMIN: "/admin",
};
