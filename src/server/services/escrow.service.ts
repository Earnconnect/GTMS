import type { Prisma } from "@prisma/client";
import { postTransaction, WalletError } from "./wallet.service";

type Tx = Prisma.TransactionClient;

/**
 * Lock requester funds into a new escrow hold. Debits available balance and
 * credits the escrow sub-balance. Must run inside a $transaction.
 */
export async function createHold(
  tx: Tx,
  requesterWalletId: string,
  amountTotal: number,
  refType: string,
  refId: string,
) {
  if (amountTotal <= 0) throw new WalletError("Escrow amount must be positive");

  const hold = await tx.escrowHold.create({
    data: { walletId: requesterWalletId, amountTotal, status: "HELD" },
  });

  await postTransaction(tx, {
    walletId: requesterWalletId,
    type: "ESCROW_HOLD",
    amount: -amountTotal, // leaves available balance
    escrowDelta: amountTotal, // enters escrow
    escrowHoldId: hold.id,
    refType,
    refId,
    description: "Funds held in escrow for task",
  });

  return hold;
}

/**
 * Release `rewardCents` from a hold to a worker (EARNING) and `feeCents` to the
 * platform system wallet (FEE). Decrements the requester's escrow balance.
 * Returns the worker's EARNING transaction.
 */
export async function releaseFromHold(
  tx: Tx,
  params: {
    holdId: string;
    requesterWalletId: string;
    workerWalletId: string;
    systemWalletId: string;
    rewardCents: number;
    feeCents: number;
    refType: string;
    refId: string;
  },
) {
  const hold = await tx.escrowHold.findUnique({ where: { id: params.holdId } });
  if (!hold) throw new WalletError("Escrow hold not found");

  const gross = params.rewardCents + params.feeCents;
  const remaining = hold.amountTotal - hold.amountReleased - hold.amountRefunded;
  if (gross > remaining) {
    throw new WalletError("Release exceeds remaining escrow");
  }

  // Decrement requester escrow sub-balance for the gross amount.
  await postTransaction(tx, {
    walletId: params.requesterWalletId,
    type: "ESCROW_RELEASE",
    amount: 0,
    escrowDelta: -gross,
    escrowHoldId: hold.id,
    refType: params.refType,
    refId: params.refId,
    description: "Escrow released for approved deliverable",
  });

  // Credit worker earnings.
  const earningTxn = await postTransaction(tx, {
    walletId: params.workerWalletId,
    type: "EARNING",
    amount: params.rewardCents,
    escrowHoldId: hold.id,
    refType: params.refType,
    refId: params.refId,
    description: "Earnings for approved deliverable",
  });

  // Credit platform fee to the system wallet.
  if (params.feeCents > 0) {
    await postTransaction(tx, {
      walletId: params.systemWalletId,
      type: "FEE",
      amount: params.feeCents,
      escrowHoldId: hold.id,
      refType: params.refType,
      refId: params.refId,
      description: "Platform fee",
    });
  }

  const newReleased = hold.amountReleased + gross;
  const fullyResolved =
    newReleased + hold.amountRefunded >= hold.amountTotal;
  await tx.escrowHold.update({
    where: { id: hold.id },
    data: {
      amountReleased: newReleased,
      status: fullyResolved ? "RELEASED" : "PARTIAL",
    },
  });

  return earningTxn;
}

/**
 * Refund all remaining (unreleased) escrow back to the requester's available
 * balance — used when a task completes/cancels with unused units.
 */
export async function refundRemaining(
  tx: Tx,
  holdId: string,
  requesterWalletId: string,
  refType: string,
  refId: string,
) {
  const hold = await tx.escrowHold.findUnique({ where: { id: holdId } });
  if (!hold) throw new WalletError("Escrow hold not found");

  const remaining = hold.amountTotal - hold.amountReleased - hold.amountRefunded;
  if (remaining <= 0) return null;

  await postTransaction(tx, {
    walletId: requesterWalletId,
    type: "ESCROW_REFUND",
    amount: remaining, // back to available
    escrowDelta: -remaining, // leaves escrow
    escrowHoldId: hold.id,
    refType,
    refId,
    description: "Unused escrow refunded",
  });

  await tx.escrowHold.update({
    where: { id: hold.id },
    data: {
      amountRefunded: hold.amountRefunded + remaining,
      status: hold.amountReleased > 0 ? "RELEASED" : "REFUNDED",
    },
  });

  return remaining;
}
