"use server";

import { requireWorker } from "@/server/rbac";
import { submitKyc } from "@/server/services/kyc.service";
import { revalidatePath } from "next/cache";

export type KycActionResult = { error?: string; success?: boolean };

export async function submitKycAction(
  _prev: KycActionResult,
  formData: FormData
): Promise<KycActionResult> {
  const user = await requireWorker();

  const docType = formData.get("docType") as string;
  const docNumber = formData.get("docNumber") as string;
  const docFrontUrl = formData.get("docFrontUrl") as string;
  const docBackUrl = formData.get("docBackUrl") as string | null;
  const selfieUrl = formData.get("selfieUrl") as string | null;

  if (!docType || !docNumber || !docFrontUrl) {
    return { error: "Document type, number, and front image are required" };
  }

  try {
    await submitKyc({
      userId: user.id,
      docType,
      docNumber,
      docFrontUrl,
      docBackUrl: docBackUrl || undefined,
      selfieUrl: selfieUrl || undefined,
    });
    revalidatePath("/dashboard/kyc");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to submit KYC" };
  }
}
