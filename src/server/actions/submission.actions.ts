"use server";

import { revalidatePath } from "next/cache";
import {
  requireActiveUser,
  requireRole,
  assertOwner,
  type SessionUser,
} from "@/server/rbac";
import { db } from "@/server/db";
import {
  approveSubmission,
  rejectSubmission,
} from "@/server/services/review.service";
import { leaveReview } from "@/server/services/review-rating.service";

export type ActionResult = { error?: string; ok?: boolean };

/** Verify the current requester owns the task behind a submission. */
async function assertOwnsSubmission(submissionId: string, user: SessionUser) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    select: { assignment: { select: { task: { select: { requesterId: true } } } } },
  });
  if (!submission) throw new Error("Submission not found");
  assertOwner(submission.assignment.task.requesterId, user);
}

export async function approveSubmissionAction(
  submissionId: string,
): Promise<ActionResult> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  try {
    await assertOwnsSubmission(submissionId, user);
    await approveSubmission(submissionId, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not approve" };
  }
  revalidatePath("/requester/tasks");
  return { ok: true };
}

export async function rejectSubmissionAction(
  submissionId: string,
  reason: string,
): Promise<ActionResult> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  try {
    await assertOwnsSubmission(submissionId, user);
    await rejectSubmission(submissionId, user.id, reason);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not reject" };
  }
  revalidatePath("/requester/tasks");
  return { ok: true };
}

export async function bulkApproveAction(
  submissionIds: string[],
): Promise<ActionResult> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  try {
    for (const id of submissionIds) {
      await assertOwnsSubmission(id, user);
      await approveSubmission(id, user.id);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not bulk approve" };
  }
  revalidatePath("/requester/tasks");
  return { ok: true };
}

/** Requester rates a worker after reviewing their submission. */
export async function leaveReviewAction(params: {
  targetId: string;
  taskId: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  try {
    const task = await db.task.findUnique({
      where: { id: params.taskId },
      select: { requesterId: true },
    });
    if (!task) throw new Error("Task not found");
    assertOwner(task.requesterId, user);
    await leaveReview({ ...params, authorId: user.id });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not leave review" };
  }
  revalidatePath(`/requester/tasks/${params.taskId}/review`);
  return { ok: true };
}
