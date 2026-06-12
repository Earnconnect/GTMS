import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";
import { logAudit } from "@/server/services/audit.service";
import { MIN_PAYOUT_CENTS } from "@/lib/constants";

export async function requestPayout(params: {
  userId: string;
  amountCents: number;
  method: string;
  details: Record<string, string>;
}) {
  const { userId, amountCents, method, details } = params;

  if (amountCents < MIN_PAYOUT_CENTS) {
    throw new Error(`Minimum payout is $${MIN_PAYOUT_CENTS / 100}`);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true, wallet: { select: { balanceCents: true, id: true } } },
  });

  if (!user) throw new Error("User not found");
  if (user.kycStatus !== "APPROVED") throw new Error("KYC verification required before withdrawing");

  const balance = user.wallet?.balanceCents ?? 0;
  if (balance < amountCents) throw new Error("Insufficient balance");

  return db.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: { userId, amountCents, method, details, status: "REQUESTED" },
    });

    await tx.walletAccount.update({
      where: { id: user.wallet!.id },
      data: { balanceCents: { decrement: amountCents } },
    });

    await tx.transaction.create({
      data: {
        walletId: user.wallet!.id,
        type: "PAYOUT",
        amountCents,
        status: "PENDING",
        description: "Payout requested",
        metadata: { payoutId: payout.id },
      },
    });

    return payout;
  });
}

export async function processPayout(params: {
  payoutId: string;
  adminId: string;
  adminNote?: string;
}) {
  const { payoutId, adminId, adminNote } = params;

  const payout = await db.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("Payout not found");
  if (payout.status !== "REQUESTED" && payout.status !== "PROCESSING") {
    throw new Error("Payout cannot be processed in its current state");
  }

  await db.payout.update({
    where: { id: payoutId },
    data: {
      status: "COMPLETED",
      processedById: adminId,
      processedAt: new Date(),
      adminNote,
    },
  });

  await notify({
    userId: payout.userId,
    type: "PAYOUT_PROCESSED",
    title: "Payout Processed",
    body: `Your payout has been processed and sent.`,
    link: "/dashboard/wallet",
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "PAYOUT_PROCESSED",
    targetType: "Payout",
    targetId: payoutId,
    metadata: { amountCents: payout.amountCents, userId: payout.userId },
  });
}

export async function cancelPayout(params: {
  payoutId: string;
  adminId: string;
  reason: string;
}) {
  const { payoutId, adminId, reason } = params;

  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { user: { select: { wallet: { select: { id: true } } } } },
  });
  if (!payout) throw new Error("Payout not found");
  if (payout.status === "COMPLETED") throw new Error("Cannot cancel completed payout");

  await db.$transaction(async (tx) => {
    await tx.payout.update({
      where: { id: payoutId },
      data: { status: "CANCELLED", adminNote: reason, processedById: adminId, processedAt: new Date() },
    });

    await tx.walletAccount.update({
      where: { id: payout.user.wallet!.id },
      data: { balanceCents: { increment: payout.amountCents } },
    });

    await tx.transaction.create({
      data: {
        walletId: payout.user.wallet!.id,
        type: "REFUND",
        amountCents: payout.amountCents,
        status: "COMPLETED",
        description: "Payout cancelled – funds returned",
        metadata: { payoutId },
      },
    });
  });

  await notify({
    userId: payout.userId,
    type: "PAYOUT_REJECTED",
    title: "Payout Cancelled",
    body: reason || "Your payout request has been cancelled and funds returned.",
    link: "/dashboard/wallet",
  });
}
