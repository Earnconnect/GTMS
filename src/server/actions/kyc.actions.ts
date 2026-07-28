"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { submitKyc, reviewKyc } from "@/server/services/kyc.service";

export type FormState = { error?: string; ok?: boolean } | undefined;

export async function submitKycAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireActiveUser();
  try {
    await submitKyc(user.id, {
      fullName: String(formData.get("fullName") ?? ""),
      country: String(formData.get("country") ?? ""),
      docType: String(formData.get("docType") ?? "passport"),
      docNumber: String(formData.get("docNumber") ?? ""),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit KYC" };
  }
  revalidatePath("/wallet");
  revalidatePath("/kyc");
  return { ok: true };
}

export async function reviewKycAction(
  userId: string,
  approve: boolean,
  reason?: string,
): Promise<{ error?: string; ok?: boolean }> {
  const admin = await requireRole("ADMIN");
  try {
    await reviewKyc(userId, admin.id, approve, reason);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not review KYC" };
  }
  revalidatePath("/admin/kyc");
  return { ok: true };
}
