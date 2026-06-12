"use server";

import { requireUser } from "@/server/rbac";
import { openDispute, postDisputeMessage } from "@/server/services/dispute.service";
import { revalidatePath } from "next/cache";

export type DisputeActionResult = { error?: string; success?: boolean; disputeId?: string };

export async function openDisputeAction(
  _prev: DisputeActionResult,
  formData: FormData
): Promise<DisputeActionResult> {
  const user = await requireUser();
  const reason = formData.get("reason") as string;
  const taskId = formData.get("taskId") as string | null;
  const submissionId = formData.get("submissionId") as string | null;

  if (!reason) return { error: "Reason required" };

  try {
    const dispute = await openDispute({
      openedById: user.id,
      reason,
      taskId: taskId || undefined,
      submissionId: submissionId || undefined,
    });
    revalidatePath("/dashboard/disputes");
    return { success: true, disputeId: dispute.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to open dispute" };
  }
}

export async function postDisputeMessageAction(
  _prev: DisputeActionResult,
  formData: FormData
): Promise<DisputeActionResult> {
  const user = await requireUser();
  const disputeId = formData.get("disputeId") as string;
  const body = formData.get("body") as string;

  if (!disputeId || !body) return { error: "Message body required" };

  try {
    await postDisputeMessage({ disputeId, authorId: user.id, body });
    revalidatePath(`/dashboard/disputes/${disputeId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to post message" };
  }
}
