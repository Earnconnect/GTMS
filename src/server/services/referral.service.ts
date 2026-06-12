import { db } from "@/server/db";

const REFERRAL_BONUS_CENTS = 500;

export async function awardReferralBonus(refereeId: string): Promise<void> {
  const referral = await db.referral.findUnique({ where: { refereeId } });
  if (!referral || referral.bonusAwarded) return;

  const referrerWallet = await db.walletAccount.findUnique({
    where: { userId: referral.referrerId },
    select: { id: true },
  });
  if (!referrerWallet) return;

  await db.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        walletId: referrerWallet.id,
        type: "REFERRAL_BONUS",
        amountCents: REFERRAL_BONUS_CENTS,
        status: "COMPLETED",
        description: "Referral bonus — your referral completed their first task",
      },
    });
    await tx.walletAccount.update({
      where: { id: referrerWallet.id },
      data: { balanceCents: { increment: REFERRAL_BONUS_CENTS } },
    });
    await tx.referral.update({
      where: { id: referral.id },
      data: { bonusAwarded: true },
    });
  });
}
