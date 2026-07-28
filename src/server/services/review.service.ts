import { db } from "@/server/db";
import { feeFromBps } from "@/lib/money";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import {
  getOrCreateWallet,
  getSystemWallet,
  WalletError,
} from "./wallet.service";
import { releaseFromHold } from "./escrow.service";
import { notify } from "./notification.service";
import { completeIfDone } from "./task.service";
import { awardReferralBonusIfEligible } from "./referral.service";

export class ReviewError extends Error {}

async function loadPendingSubmission(submissionId: string) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { task: true } } },
  });
  if (!submission) throw new ReviewError("Submission not found");
  if (submission.status !== "PENDING") {
    throw new ReviewError(`Submission is ${submission.status}, not pending`);
  }
  return submission;
}

/**
 * Approve a submission: release reward to the worker and fee to the platform
 * from the task's escrow hold, mark everything approved, and notify the worker.
 * `reviewerId` is the requester (manual) or the system user (auto-approve).
 */
export async function approveSubmission(submissionId: string, reviewerId: string) {
  const submission = await loadPendingSubmission(submissionId);
  const { task } = submission.assignment;
  if (!task.escrowHoldId) throw new ReviewError("Task has no escrow hold");

  const reward = task.rewardPerUnit;
  const fee = feeFromBps(reward, PLATFORM_FEE_BPS);

  const [requesterWallet, workerWallet, systemWallet] = await Promise.all([
    getOrCreateWallet(task.requesterId),
    getOrCreateWallet(submission.workerId),
    getSystemWallet(),
  ]);

  await db.$transaction(async (tx) => {
    const earningTxn = await releaseFromHold(tx, {
      holdId: task.escrowHoldId!,
      requesterWalletId: requesterWallet.id,
      workerWalletId: workerWallet.id,
      systemWalletId: systemWallet.id,
      rewardCents: reward,
      feeCents: fee,
      refType: "SUBMISSION",
      refId: submission.id,
    });

    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: "APPROVED",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        earningTxnId: earningTxn.id,
      },
    });
    await tx.assignment.update({
      where: { id: submission.assignmentId },
      data: { status: "APPROVED" },
    });
    await notify(
      submission.workerId,
      "SUBMISSION_APPROVED",
      `Approved: "${task.title}"`,
      {
        body: `You earned ${(reward / 100).toFixed(2)}.`,
        link: "/wallet",
        tx,
      },
    );
  });

  // Platform-funded referral bonus on the worker's first approved deliverable.
  await awardReferralBonusIfEligible(submission.workerId);
  await completeIfDone(task.id);
}

/**
 * Reject a submission. Escrow is NOT released (it is refunded to the requester
 * when the task completes). The worker is notified and may open a dispute.
 */
export async function rejectSubmission(
  submissionId: string,
  reviewerId: string,
  reason: string,
) {
  const submission = await loadPendingSubmission(submissionId);
  const { task } = submission.assignment;
  if (!reason.trim()) throw new ReviewError("A rejection reason is required");

  await db.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: "REJECTED",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectReason: reason.trim(),
      },
    });
    await tx.assignment.update({
      where: { id: submission.assignmentId },
      data: { status: "REJECTED" },
    });
    await notify(
      submission.workerId,
      "SUBMISSION_REJECTED",
      `Rejected: "${task.title}"`,
      {
        body: reason.trim(),
        link: "/submissions",
        tx,
      },
    );
  });

  await completeIfDone(task.id);
}

/** Cron helper: auto-approve PENDING submissions past their review window. */
export async function autoApproveExpired(): Promise<number> {
  const system = await db.user.findUnique({
    where: { email: "system@gtms.local" },
    select: { id: true },
  });
  if (!system) throw new WalletError("System user missing — run the seed script.");

  const due = await db.submission.findMany({
    where: { status: "PENDING", autoApproveAt: { lt: new Date() } },
    select: { id: true },
    take: 200,
  });

  let count = 0;
  for (const s of due) {
    try {
      await approveSubmission(s.id, system.id);
      count++;
    } catch {
      // skip any that can't be approved (e.g. already changed)
    }
  }
  return count;
}
