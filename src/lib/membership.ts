import type { MembershipTier, PayoutSchedule } from "@/generated/prisma";

export interface TierConfig {
  monthlyFeeCents: number;
  tasksPerDay: number;
  maxRewardPerTaskCents: number;
  payoutSchedule: PayoutSchedule;
  canAccessQaTasks: boolean;
  certSlotsPerMonth: number;
  label: string;
  color: string;
}

export const TIER_LIMITS: Record<MembershipTier, TierConfig> = {
  BASIC: {
    monthlyFeeCents: 2900,
    tasksPerDay: 20,
    maxRewardPerTaskCents: 200,
    payoutSchedule: "WEEKLY",
    canAccessQaTasks: false,
    certSlotsPerMonth: 1,
    label: "Basic",
    color: "gray",
  },
  PROFESSIONAL: {
    monthlyFeeCents: 7900,
    tasksPerDay: 100,
    maxRewardPerTaskCents: 1000,
    payoutSchedule: "BIWEEKLY",
    canAccessQaTasks: true,
    certSlotsPerMonth: 2,
    label: "Professional",
    color: "blue",
  },
  EXECUTIVE: {
    monthlyFeeCents: 19900,
    tasksPerDay: 500,
    maxRewardPerTaskCents: 2000,
    payoutSchedule: "INSTANT",
    canAccessQaTasks: true,
    certSlotsPerMonth: 4,
    label: "Executive",
    color: "purple",
  },
};

const TIER_ORDER: MembershipTier[] = ["BASIC", "PROFESSIONAL", "EXECUTIVE"];

export function tierOrdinal(tier: MembershipTier): number {
  return TIER_ORDER.indexOf(tier);
}
