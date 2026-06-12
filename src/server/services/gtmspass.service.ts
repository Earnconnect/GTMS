import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";
import { GTMS_PASS_CENTS } from "@/lib/constants";

function effectivePassPrice(discountPct: number): number {
  if (discountPct <= 0) return GTMS_PASS_CENTS;
  return Math.floor(GTMS_PASS_CENTS * (100 - discountPct) / 100);
}

export async function purchaseGtmsPass(userId: string) {
  const worker = await db.user.findUnique({
    where: { id: userId },
    select: {
      gtmsPassActive: true,
      gtmsPassDiscountPct: true,
      status: true,
      wallet: { select: { id: true, balanceCents: true } },
    },
  });

  if (!worker) throw new Error("User not found");
  if (worker.gtmsPassActive) throw new Error("GTMS Pass is already active on your account");
  if (worker.status === "DORMANT") throw new Error("Reactivate your account before purchasing a pass");
  if (!worker.wallet) throw new Error("Wallet not found");

  const discountPct = worker.gtmsPassDiscountPct ?? 0;
  const priceCents  = effectivePassPrice(discountPct);

  if (worker.wallet.balanceCents < priceCents) {
    throw new Error(
      `Insufficient balance. GTMS Pass costs $${(priceCents / 100).toFixed(2)}. ` +
        `You have $${(worker.wallet.balanceCents / 100).toFixed(2)}.`
    );
  }

  await db.$transaction(async (tx) => {
    await tx.walletAccount.update({
      where: { id: worker.wallet!.id },
      data: { balanceCents: { decrement: priceCents } },
    });

    await tx.transaction.create({
      data: {
        walletId: worker.wallet!.id,
        type: "GTMS_PASS_FEE",
        amountCents: priceCents,
        status: "COMPLETED",
        description:
          discountPct > 0
            ? `GTMS Pass — VIP access (${discountPct}% first-user discount applied)`
            : "GTMS Pass — VIP Combination task access",
        metadata: discountPct > 0 ? { discountPct, originalPriceCents: GTMS_PASS_CENTS } : undefined,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        gtmsPassActive: true,
        gtmsPassPurchasedAt: new Date(),
        gtmsPassDiscountPct: 0, // consumed
      },
    });
  });

  await notify({
    userId,
    type: "GTMS_PASS_ACTIVATED",
    title: "GTMS Pass Activated!",
    body:
      discountPct > 0
        ? `Your GTMS Pass is active (saved $${((GTMS_PASS_CENTS - priceCents) / 100).toFixed(2)} with your first-user discount). Combination VIP tasks are now unlocked!`
        : "Your GTMS Pass is active. Combination VIP tasks (400% earnings) are now unlocked.",
    link: "/browse?category=COMBINATION",
  });
}

export async function getGtmsPassStatus(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      gtmsPassActive: true,
      gtmsPassPurchasedAt: true,
      gtmsPassDiscountPct: true,
      firstMilestoneClaimed: true,
      wallet: { select: { balanceCents: true } },
    },
  });

  const discountPct  = user?.gtmsPassDiscountPct ?? 0;
  const priceCents   = effectivePassPrice(discountPct);
  const savingsCents = GTMS_PASS_CENTS - priceCents;

  return {
    active:               user?.gtmsPassActive       ?? false,
    purchasedAt:          user?.gtmsPassPurchasedAt  ?? null,
    walletBalance:        user?.wallet?.balanceCents ?? 0,
    canAfford:            (user?.wallet?.balanceCents ?? 0) >= priceCents,
    discountPct,
    priceCents,
    savingsCents,
    originalPriceCents:   GTMS_PASS_CENTS,
    firstMilestoneClaimed: user?.firstMilestoneClaimed ?? false,
  };
}
