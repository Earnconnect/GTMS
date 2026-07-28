"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { toCents } from "@/lib/money";
import { depositFunds } from "@/server/services/wallet.service";
import { requestPayout } from "@/server/services/payout.service";

export type FormState = { error?: string; ok?: boolean } | undefined;

/** Requester-only: add funds. Workers can never reach this (guarded twice). */
export async function depositAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  const cents = toCents(String(formData.get("amount") ?? "0"));
  if (cents <= 0) return { error: "Enter a positive amount" };
  try {
    await depositFunds(user.id, cents);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Deposit failed" };
  }
  revalidatePath("/requester/wallet");
  return { ok: true };
}

/** Worker-only: request a payout of available earnings. */
export async function payoutAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  const cents = toCents(String(formData.get("amount") ?? "0"));
  if (cents <= 0) return { error: "Enter a positive amount" };
  try {
    await requestPayout(user.id, cents);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Payout request failed" };
  }
  revalidatePath("/wallet");
  return { ok: true };
}
