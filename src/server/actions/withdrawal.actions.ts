"use server";

import { revalidatePath } from "next/cache";
import type { PayoutMethodType } from "@prisma/client";
import { requireActiveUser } from "@/server/rbac";
import { db } from "@/server/db";

export type ActionResult = { error?: string; ok?: boolean };

/**
 * Employee saves their withdrawal (payout) method. SECURITY: the full account
 * number is never stored — we keep only the last 4 digits for display. Payouts
 * are simulated, so no real transfer occurs.
 */
export async function saveWithdrawalMethodAction(input: {
  type: PayoutMethodType;
  accountName: string;
  institution?: string;
  accountNumber: string;
  country?: string;
  currency?: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();

  const accountName = input.accountName.trim();
  if (!accountName) return { error: "Account holder name is required." };

  const digits = input.accountNumber.replace(/\D/g, "");
  if (digits.length < 4) return { error: "Enter a valid account number." };
  const accountLast4 = digits.slice(-4);

  try {
    await db.withdrawalMethod.upsert({
      where: { userId: user.id },
      update: {
        type: input.type,
        accountName,
        institution: input.institution?.trim() || null,
        accountLast4,
        country: input.country?.trim() || null,
        currency: input.currency?.trim() || "USD",
      },
      create: {
        userId: user.id,
        type: input.type,
        accountName,
        institution: input.institution?.trim() || null,
        accountLast4,
        country: input.country?.trim() || null,
        currency: input.currency?.trim() || "USD",
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save withdrawal method" };
  }
  revalidatePath("/onboarding");
  revalidatePath("/wallet");
  return { ok: true };
}
