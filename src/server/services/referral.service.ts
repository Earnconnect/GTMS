import { randomBytes } from "crypto";
import { db } from "@/server/db";
import { REFERRAL_BONUS_CENTS } from "@/lib/constants";
import {
  getOrCreateWallet,
  getSystemWallet,
  postTransaction,
} from "./wallet.service";
import { notify } from "./notification.service";

/** Generate a short, unique referral code for a user. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  for (let i = 0; i < 5; i++) {
    const code = randomBytes(4).toString("hex");
    const taken = await db.user.findUnique({ where: { referralCode: code } });
    if (!taken) {
      await db.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    }
  }
  throw new Error("Could not generate referral code");
}

/** Resolve a referral code to the referrer's user id (if valid). */
export async function resolveReferrer(code: string): Promise<string | null> {
  if (!code) return null;
  const user = await db.user.findUnique({
    where: { referralCode: code.trim().toLowerCase() },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Award the referrer a PLATFORM-FUNDED bonus when their invitee earns their
 * first approved deliverable. Funded from the system wallet (platform's own
 * money) — never from any user's deposit, never gated behind a paid tier.
 * Idempotent via the invitee's `referralBonusAwarded` flag.
 */
export async function awardReferralBonusIfEligible(inviteeId: string) {
  if (REFERRAL_BONUS_CENTS <= 0) return;

  const invitee = await db.user.findUnique({
    where: { id: inviteeId },
    select: { referredById: true, referralBonusAwarded: true, name: true },
  });
  if (!invitee?.referredById || invitee.referralBonusAwarded) return;

  const [systemWallet, referrerWallet] = await Promise.all([
    getSystemWallet(),
    getOrCreateWallet(invitee.referredById),
  ]);

  await db.$transaction(async (tx) => {
    // Re-check inside the transaction to avoid double-award races.
    const fresh = await tx.user.findUnique({
      where: { id: inviteeId },
      select: { referralBonusAwarded: true },
    });
    if (fresh?.referralBonusAwarded) return;

    await postTransaction(tx, {
      walletId: systemWallet.id,
      type: "REFERRAL_BONUS",
      amount: -REFERRAL_BONUS_CENTS,
      allowNegative: true, // platform funds this from its own account
      refType: "REFERRAL",
      refId: inviteeId,
      description: "Referral bonus funded by platform",
    });
    await postTransaction(tx, {
      walletId: referrerWallet.id,
      type: "REFERRAL_BONUS",
      amount: REFERRAL_BONUS_CENTS,
      refType: "REFERRAL",
      refId: inviteeId,
      description: `Referral bonus — ${invitee.name ?? "your invitee"} completed their first task`,
    });
    await tx.user.update({
      where: { id: inviteeId },
      data: { referralBonusAwarded: true },
    });
    await notify(
      invitee.referredById!,
      "SYSTEM",
      "Referral bonus earned",
      {
        body: `You earned ${(REFERRAL_BONUS_CENTS / 100).toFixed(2)} — your invitee completed their first task.`,
        link: "/wallet",
        tx,
      },
    );
  });
}
