import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { feeFromBps } from "@/lib/money";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { getOrCreateWallet, getSystemWallet } from "./wallet.service";
import { releaseFromHold } from "./escrow.service";
import { notify } from "./notification.service";
import { completeIfDone } from "./task.service";

export class DisputeError extends Error {}

/**
 * A worker opens a dispute on their REJECTED submission. Marks the submission
 * DISPUTED and notifies the requester and admins.
 */
export async function openDispute(
  submissionId: string,
  workerId: string,
  reason: string,
) {
  if (!reason.trim()) throw new DisputeError("Please describe the issue");

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { task: true } }, dispute: true },
  });
  if (!submission) throw new DisputeError("Submission not found");
  if (submission.workerId !== workerId) throw new DisputeError("Not your submission");
  if (submission.status !== "REJECTED") {
    throw new DisputeError("Only rejected submissions can be disputed");
  }
  if (submission.dispute) throw new DisputeError("A dispute already exists");

  return db.$transaction(async (tx) => {
    const dispute = await tx.dispute.create({
      data: {
        submissionId,
        raisedById: workerId,
        reason: reason.trim(),
        status: "OPEN",
      },
    });
    await tx.submission.update({
      where: { id: submissionId },
      data: { status: "DISPUTED" },
    });
    await notify(
      submission.assignment.task.requesterId,
      "DISPUTE_OPENED",
      `Dispute opened on "${submission.assignment.task.title}"`,
      { body: reason.trim(), link: "/requester/disputes", tx },
    );
    return dispute;
  });
}

export async function postDisputeMessage(
  disputeId: string,
  authorId: string,
  body: string,
) {
  if (!body.trim()) throw new DisputeError("Message cannot be empty");
  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: { submission: { include: { assignment: { include: { task: true } } } } },
  });
  if (!dispute) throw new DisputeError("Dispute not found");

  const participants = new Set([
    dispute.raisedById,
    dispute.submission.workerId,
    dispute.submission.assignment.task.requesterId,
  ]);
  // Admins can always post; participants too.
  const author = await db.user.findUnique({
    where: { id: authorId },
    select: { role: true },
  });
  if (author?.role !== "ADMIN" && !participants.has(authorId)) {
    throw new DisputeError("You are not a participant in this dispute");
  }

  return db.disputeMessage.create({
    data: { disputeId, authorId, body: body.trim() },
  });
}

/**
 * Admin resolves a dispute.
 *  - "WORKER": release the reward to the worker (overturns the rejection).
 *  - "REQUESTER": uphold the rejection (escrow refunds at task completion).
 */
export async function resolveDispute(
  disputeId: string,
  adminId: string,
  decision: "WORKER" | "REQUESTER",
  note: string,
) {
  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: { submission: { include: { assignment: { include: { task: true } } } } },
  });
  if (!dispute) throw new DisputeError("Dispute not found");
  if (dispute.status.startsWith("RESOLVED")) {
    throw new DisputeError("Dispute already resolved");
  }

  const submission = dispute.submission;
  const task = submission.assignment.task;

  if (decision === "WORKER") {
    if (!task.escrowHoldId) throw new DisputeError("Task has no escrow hold");
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
        refType: "DISPUTE",
        refId: dispute.id,
      });
      await tx.submission.update({
        where: { id: submission.id },
        data: { status: "APPROVED", earningTxnId: earningTxn.id, reviewedById: adminId },
      });
      await tx.assignment.update({
        where: { id: submission.assignmentId },
        data: { status: "APPROVED" },
      });
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: "RESOLVED_WORKER",
          resolutionNote: note,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });
      await notifyBoth(tx, dispute, task.title, "in your favor", "for the requester", "WORKER");
    });
  } else {
    await db.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submission.id },
        data: { status: "REJECTED" },
      });
      await tx.assignment.update({
        where: { id: submission.assignmentId },
        data: { status: "REJECTED" },
      });
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: "RESOLVED_REQUESTER",
          resolutionNote: note,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });
      await notifyBoth(tx, dispute, task.title, "for the requester", "in your favor", "REQUESTER");
    });
  }

  await completeIfDone(task.id);
}

type Tx = Prisma.TransactionClient;

async function notifyBoth(
  tx: Tx,
  dispute: { submission: { workerId: string; assignment: { task: { requesterId: string } } } },
  taskTitle: string,
  workerOutcome: string,
  requesterOutcome: string,
  _decision: "WORKER" | "REQUESTER",
) {
  await notify(
    dispute.submission.workerId,
    "DISPUTE_RESOLVED",
    `Dispute resolved on "${taskTitle}"`,
    { body: `Resolved ${workerOutcome}.`, link: "/disputes", tx },
  );
  await notify(
    dispute.submission.assignment.task.requesterId,
    "DISPUTE_RESOLVED",
    `Dispute resolved on "${taskTitle}"`,
    { body: `Resolved ${requesterOutcome}.`, link: "/requester/disputes", tx },
  );
}
