import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { getPaymentProvider } from "@/server/payments";
import { MIN_PAYOUT_CENTS, REQUIRE_KYC_FOR_PAYOUT } from "@/lib/constants";
import { postTransaction, WalletError } from "./wallet.service";

/**
 * Worker requests a payout. Flat minimum only — NO tiers, NO unlock fees, NO
 * gating. The amount is debited from available balance immediately (as a
 * COMPLETED PAYOUT txn) so it can't be double-spent while pending.
 */
export async function requestPayout(userId: string, amountCents: number) {
  if (amountCents < MIN_PAYOUT_CENTS) {
    throw new WalletError(
      `Minimum payout is ${(MIN_PAYOUT_CENTS / 100).toFixed(2)}.`,
    );
  }

  if (REQUIRE_KYC_FOR_PAYOUT) {
    const u = await db.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    if (u?.kycStatus !== "APPROVED") {
      throw new WalletError(
        "Complete identity verification (KYC) before withdrawing.",
      );
    }
  }

  // A payout destination must be on file before any withdrawal.
  const method = await db.withdrawalMethod.findUnique({ where: { userId } });
  if (!method) {
    throw new WalletError(
      "Add your withdrawal details before requesting a payout.",
    );
  }

  return db.$transaction(async (tx) => {
    const wallet = await tx.walletAccount.findUnique({ where: { userId } });
    if (!wallet) throw new WalletError("Wallet not found");
    if (amountCents > wallet.balance) {
      throw new WalletError("Amount exceeds available balance");
    }

    const payout = await tx.payout.create({
      data: {
        walletId: wallet.id,
        userId,
        amount: amountCents,
        status: "REQUESTED",
      },
    });

    await postTransaction(tx, {
      walletId: wallet.id,
      type: "PAYOUT",
      amount: -amountCents,
      payoutId: payout.id,
      refType: "PAYOUT",
      refId: payout.id,
      description: "Payout requested",
    });

    return payout;
  });
}

/**
 * Admin approves and processes a payout via the payment provider.
 * On provider failure, the previously debited funds are restored.
 */
export async function processPayout(payoutId: string, adminId: string) {
  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { wallet: true },
  });
  if (!payout) throw new WalletError("Payout not found");
  if (payout.status !== "REQUESTED" && payout.status !== "APPROVED") {
    throw new WalletError(`Payout cannot be processed from status ${payout.status}`);
  }

  await db.payout.update({
    where: { id: payoutId },
    data: { status: "PROCESSING", approvedById: adminId },
  });

  const result = await getPaymentProvider().payout({
    userId: payout.userId,
    amountCents: payout.amount,
    idempotencyKey: randomUUID(),
    description: "GTMS earnings payout",
  });

  if (result.ok) {
    return db.payout.update({
      where: { id: payoutId },
      data: { status: "PAID", providerRef: result.providerRef },
    });
  }

  // Provider failed — restore the worker's balance and mark FAILED.
  await db.$transaction(async (tx) => {
    await postTransaction(tx, {
      walletId: payout.walletId,
      type: "ADJUSTMENT",
      amount: payout.amount, // credit back
      payoutId: payout.id,
      refType: "PAYOUT",
      refId: payout.id,
      description: "Payout failed — funds restored",
    });
    await tx.payout.update({
      where: { id: payoutId },
      data: { status: "FAILED", failureReason: result.error ?? "Provider error" },
    });
  });

  throw new WalletError(result.error ?? "Payout failed");
}

/** Admin cancels a pending payout and restores the worker's balance. */
export async function cancelPayout(payoutId: string) {
  const payout = await db.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new WalletError("Payout not found");
  if (payout.status !== "REQUESTED" && payout.status !== "APPROVED") {
    throw new WalletError("Only pending payouts can be cancelled");
  }

  return db.$transaction(async (tx) => {
    await postTransaction(tx, {
      walletId: payout.walletId,
      type: "ADJUSTMENT",
      amount: payout.amount,
      payoutId: payout.id,
      refType: "PAYOUT",
      refId: payout.id,
      description: "Payout cancelled — funds restored",
    });
    return tx.payout.update({
      where: { id: payoutId },
      data: { status: "CANCELLED" },
    });
  });
}
