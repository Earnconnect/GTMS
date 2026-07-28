import { randomUUID } from "crypto";
import type { Prisma, TxnType, TxnStatus } from "@prisma/client";
import { db } from "@/server/db";
import { getPaymentProvider } from "@/server/payments";
import { canDeposit } from "@/lib/permissions";
import { SYSTEM_USER_EMAIL } from "@/lib/constants";

type Tx = Prisma.TransactionClient;

/** Transaction types that move money INTO an account as a deposit/hold of
 *  requester funds. These must NEVER apply to a worker wallet. */
const REQUESTER_ONLY_TXN: TxnType[] = ["DEPOSIT", "ESCROW_HOLD"];

export class WalletError extends Error {}

export async function getOrCreateWallet(userId: string) {
  const existing = await db.walletAccount.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.walletAccount.create({ data: { userId } });
}

export async function getWalletByUser(userId: string) {
  return db.walletAccount.findUnique({ where: { userId } });
}

/** The platform/system wallet that collects fees. */
export async function getSystemWallet() {
  const system = await db.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL },
    include: { wallet: true },
  });
  if (!system?.wallet) {
    throw new WalletError("System wallet missing — run the seed script.");
  }
  return system.wallet;
}

export interface PostTxnParams {
  walletId: string;
  type: TxnType;
  /** Signed change to AVAILABLE balance (cents). 0 if this only moves escrow. */
  amount: number;
  /** Signed change to ESCROW balance (cents). */
  escrowDelta?: number;
  status?: TxnStatus;
  escrowHoldId?: string;
  payoutId?: string;
  refType?: string;
  refId?: string;
  providerRef?: string;
  description?: string;
  /** Allow the available balance to go negative (platform/system wallet only). */
  allowNegative?: boolean;
}

/**
 * The single chokepoint for all balance changes. Appends an immutable ledger
 * row and updates the wallet's cached available/escrow balances atomically.
 *
 * GUARDRAIL: rejects DEPOSIT/ESCROW_HOLD against a WORKER wallet — money may
 * only flow requester -> escrow -> worker, never the other way.
 */
export async function postTransaction(tx: Tx, params: PostTxnParams) {
  const wallet = await tx.walletAccount.findUnique({
    where: { id: params.walletId },
    include: { user: { select: { role: true } } },
  });
  if (!wallet) throw new WalletError("Wallet not found");

  if (
    REQUESTER_ONLY_TXN.includes(params.type) &&
    wallet.user.role === "WORKER"
  ) {
    throw new WalletError(
      `Guardrail violation: ${params.type} is not allowed on a worker wallet. Workers never deposit funds.`,
    );
  }

  const escrowDelta = params.escrowDelta ?? 0;
  const newBalance = wallet.balance + params.amount;
  const newEscrow = wallet.escrowBalance + escrowDelta;

  if (newBalance < 0 && params.type !== "ADJUSTMENT" && !params.allowNegative) {
    throw new WalletError("Insufficient available balance");
  }
  if (newEscrow < 0) {
    throw new WalletError("Escrow balance cannot go negative");
  }

  await tx.walletAccount.update({
    where: { id: wallet.id },
    data: { balance: newBalance, escrowBalance: newEscrow },
  });

  return tx.transaction.create({
    data: {
      walletId: wallet.id,
      type: params.type,
      status: params.status ?? "COMPLETED",
      amount: params.amount,
      balanceAfter: newBalance,
      escrowHoldId: params.escrowHoldId,
      payoutId: params.payoutId,
      refType: params.refType,
      refId: params.refId,
      providerRef: params.providerRef,
      description: params.description,
    },
  });
}

/**
 * Requester deposit: charge the external provider, then credit available
 * balance. GUARDRAIL: only requesters/admins may deposit; workers cannot.
 */
export async function depositFunds(
  userId: string,
  amountCents: number,
  description = "Account deposit",
) {
  if (amountCents <= 0) throw new WalletError("Deposit amount must be positive");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) throw new WalletError("User not found");
  if (!canDeposit(user.role)) {
    throw new WalletError("Only requesters can add funds. Workers never deposit.");
  }

  const wallet = await getOrCreateWallet(userId);
  const idempotencyKey = randomUUID();

  const result = await getPaymentProvider().charge({
    userId,
    amountCents,
    idempotencyKey,
    description,
  });
  if (!result.ok) {
    throw new WalletError(result.error ?? "Payment provider declined the charge");
  }

  return db.$transaction((tx) =>
    postTransaction(tx, {
      walletId: wallet.id,
      type: "DEPOSIT",
      amount: amountCents,
      providerRef: result.providerRef,
      description,
    }),
  );
}

/**
 * Credit a deposit confirmed externally (e.g. via Stripe webhook).
 * Unlike depositFunds(), this skips calling the payment provider — the
 * provider already confirmed the charge via webhook. Idempotent on providerRef.
 */
export async function creditDeposit(
  userId: string,
  amountCents: number,
  providerRef: string,
  description = "Account deposit",
) {
  if (amountCents <= 0) throw new WalletError("Deposit amount must be positive");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) throw new WalletError("User not found");
  if (!canDeposit(user.role)) {
    throw new WalletError("Only requesters can receive deposits. Workers never deposit.");
  }

  // Idempotency: skip if this providerRef was already credited.
  const existing = await db.transaction.findFirst({
    where: { providerRef, type: "DEPOSIT" },
  });
  if (existing) return existing;

  const wallet = await getOrCreateWallet(userId);
  return db.$transaction((tx) =>
    postTransaction(tx, {
      walletId: wallet.id,
      type: "DEPOSIT",
      amount: amountCents,
      providerRef,
      description,
    }),
  );
}

/**
 * Reconcile a wallet: recompute available + escrow from the ledger and
 * compare against cached balances. Used by the admin ledger page.
 */
export async function reconcileWallet(walletId: string) {
  const wallet = await db.walletAccount.findUnique({
    where: { id: walletId },
    include: { transactions: true, escrowHolds: true },
  });
  if (!wallet) throw new WalletError("Wallet not found");

  const computedBalance = wallet.transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const computedEscrow = wallet.escrowHolds
    .filter((h) => h.status === "HELD" || h.status === "PARTIAL")
    .reduce((sum, h) => sum + (h.amountTotal - h.amountReleased - h.amountRefunded), 0);

  return {
    walletId,
    cachedBalance: wallet.balance,
    computedBalance,
    balanceOk: wallet.balance === computedBalance,
    cachedEscrow: wallet.escrowBalance,
    computedEscrow,
    escrowOk: wallet.escrowBalance === computedEscrow,
  };
}
