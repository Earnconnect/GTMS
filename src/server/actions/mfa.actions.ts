"use server";

import { requireUser } from "@/server/rbac";
import { db } from "@/server/db";
import { enableMfa, disableMfa, verifyMfaCode } from "@/server/services/mfa.service";
import { revalidatePath } from "next/cache";

export type MfaActionResult = { error?: string; success?: boolean };

export async function enableMfaAction(code: string): Promise<MfaActionResult> {
  const user = await requireUser();
  const valid = await verifyMfaCode(user.id, code);
  if (!valid) return { error: "Invalid verification code. Please try again." };
  await enableMfa(user.id);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function disableMfaAction(): Promise<MfaActionResult> {
  const user = await requireUser();
  await disableMfa(user.id);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getMfaStatusAction() {
  const user = await requireUser();
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { mfaEnabled: true },
  });
  return { mfaEnabled: dbUser?.mfaEnabled ?? false };
}
