"use server";

import { requireWorker, requireUser } from "@/server/rbac";
import { requestDeposit } from "@/server/services/deposit.service";
import { requestPayout } from "@/server/services/payout.service";
import { revalidatePath } from "next/cache";

export type WalletActionResult = { error?: string; success?: boolean };

export async function requestDepositAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireUser();
  const amountStr = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const proofUrl = formData.get("proofUrl") as string | null;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };
  if (!paymentMethod) return { error: "Payment method required" };

  const amountCents = Math.round(amount * 100);

  try {
    await requestDeposit({
      userId: user.id,
      amountCents,
      paymentMethod,
      proofUrl: proofUrl || undefined,
    });
    revalidatePath("/dashboard/wallet");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to request deposit" };
  }
}

export async function requestPayoutAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireWorker();
  const amountStr = formData.get("amount") as string;
  const method = formData.get("method") as string;
  const accountName = formData.get("accountName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const bankName = formData.get("bankName") as string;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };
  if (!method) return { error: "Payout method required" };

  const amountCents = Math.round(amount * 100);

  try {
    await requestPayout({
      userId: user.id,
      amountCents,
      method,
      details: { accountName, accountNumber, bankName },
    });
    revalidatePath("/dashboard/wallet");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to request payout" };
  }
}
