"use server";

import { requireBusiness } from "@/server/rbac";
import { approveSubmission, rejectSubmission } from "@/server/services/review.service";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export type BusinessActionResult = { error?: string; success?: boolean };

export async function businessApproveSubmissionAction(submissionId: string): Promise<BusinessActionResult> {
  const user = await requireBusiness();

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { task: { select: { requesterId: true } } } } },
  });

  if (!submission || submission.assignment.task.requesterId !== user.id) {
    return { error: "Not authorized" };
  }

  try {
    await approveSubmission({ submissionId, reviewerId: user.id });
    revalidatePath("/business/tasks");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function businessRejectSubmissionAction(submissionId: string, reason: string): Promise<BusinessActionResult> {
  const user = await requireBusiness();

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { task: { select: { requesterId: true } } } } },
  });

  if (!submission || submission.assignment.task.requesterId !== user.id) {
    return { error: "Not authorized" };
  }

  try {
    await rejectSubmission({ submissionId, reviewerId: user.id, reason });
    revalidatePath("/business/tasks");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}
