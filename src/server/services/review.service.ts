import { db } from "@/server/db";
import { creditEarning, postTransaction } from "@/server/services/wallet.service";
import { recomputeScores } from "@/server/services/score.service";
import { promoteIfEligible } from "@/server/services/career.service";
import { notify } from "@/server/services/notification.service";
import { awardReferralBonus } from "@/server/services/referral.service";
import {
  EXECUTIVE_MILESTONE_TASKS,
  EXECUTIVE_MILESTONE_BONUS_CENTS,
  FIRST_MILESTONE_TASKS,
  FIRST_USER_DISCOUNT_PCT,
  GTMS_PASS_CENTS,
} from "@/lib/constants";

export async function approveSubmission(params: {
  submissionId: string;
  reviewerId: string;
}) {
  const { submissionId, reviewerId } = params;

  const sub = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: { include: { task: { select: { rewardPerUnitCents: true, title: true } } } },
    },
  });
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "PENDING") throw new Error("Submission already processed");

  await db.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submissionId },
      data: { status: "APPROVED", reviewedById: reviewerId, reviewedAt: new Date() },
    });
    await tx.assignment.update({
      where: { id: sub.assignmentId },
      data: { status: "APPROVED" },
    });
  });

  await creditEarning({
    workerId: sub.workerId,
    amountCents: sub.assignment.task.rewardPerUnitCents,
    description: `Task approved: ${sub.assignment.task.title}`,
    submissionId,
  });

  await notify({
    userId: sub.workerId,
    type: "TASK_APPROVED",
    title: "Submission Approved",
    body: `Your work on "${sub.assignment.task.title}" has been approved.`,
    link: `/dashboard/submissions/${submissionId}`,
  });

  await recomputeScores(sub.workerId);
  await promoteIfEligible(sub.workerId);

  // Award referral bonus on the worker's first ever approved submission
  const priorApprovals = await db.submission.count({
    where: { workerId: sub.workerId, status: { in: ["APPROVED", "AUTO_APPROVED"] } },
  });
  if (priorApprovals === 1) {
    await awardReferralBonus(sub.workerId).catch(() => {});
  }

  // Award Executive daily milestone bonus
  await checkExecutiveMilestone(sub.workerId).catch(() => {});

  // Introduce Combination tasks and grant 25% discount after first 10 approvals
  await checkFirstMilestone(sub.workerId).catch(() => {});
}

export async function rejectSubmission(params: {
  submissionId: string;
  reviewerId: string;
  reason: string;
}) {
  const { submissionId, reviewerId, reason } = params;

  const sub = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { task: { select: { title: true } } } } },
  });
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "PENDING") throw new Error("Submission already processed");

  await db.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submissionId },
      data: { status: "REJECTED", reviewedById: reviewerId, reviewedAt: new Date(), rejectReason: reason },
    });
    await tx.assignment.update({
      where: { id: sub.assignmentId },
      data: { status: "REJECTED" },
    });
  });

  await notify({
    userId: sub.workerId,
    type: "TASK_REJECTED",
    title: "Submission Rejected",
    body: `Your submission was rejected: ${reason}`,
    link: `/dashboard/submissions/${submissionId}`,
  });

  await recomputeScores(sub.workerId);
}

export async function autoApproveExpired() {
  const now = new Date();

  const pending = await db.submission.findMany({
    where: { status: "PENDING", autoApproveAt: { lte: now } },
    include: {
      assignment: { include: { task: { select: { rewardPerUnitCents: true, title: true } } } },
    },
    take: 100,
  });

  let count = 0;
  for (const sub of pending) {
    try {
      await db.$transaction(async (tx) => {
        await tx.submission.update({
          where: { id: sub.id },
          data: { status: "AUTO_APPROVED", reviewedAt: new Date() },
        });
        await tx.assignment.update({
          where: { id: sub.assignmentId },
          data: { status: "APPROVED" },
        });
      });

      await creditEarning({
        workerId: sub.workerId,
        amountCents: sub.assignment.task.rewardPerUnitCents,
        description: `Auto-approved: ${sub.assignment.task.title}`,
        submissionId: sub.id,
      });

      await recomputeScores(sub.workerId);
      count++;
    } catch {
      // Skip individual failures
    }
  }
  return count;
}

// Award $5 milestone bonus to Executive workers who hit 10 approvals in a day
async function checkExecutiveMilestone(workerId: string): Promise<void> {
  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: {
      membership: { select: { tier: true, status: true } },
      wallet: { select: { id: true } },
    },
  });

  if (
    !worker?.wallet ||
    worker.membership?.status !== "ACTIVE" ||
    worker.membership.tier !== "EXECUTIVE"
  ) return;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await db.submission.count({
    where: {
      workerId,
      status: { in: ["APPROVED", "AUTO_APPROVED"] },
      reviewedAt: { gte: startOfDay },
    },
  });

  // Fire exactly once — when the count hits the milestone for the first time today
  if (todayCount === EXECUTIVE_MILESTONE_TASKS) {
    await postTransaction({
      walletId: worker.wallet.id,
      type: "MILESTONE_BONUS",
      amountCents: EXECUTIVE_MILESTONE_BONUS_CENTS,
      description: `Executive Milestone Bonus — ${EXECUTIVE_MILESTONE_TASKS} tasks completed today`,
    });

    await notify({
      userId: workerId,
      type: "MILESTONE_BONUS",
      title: "Executive Milestone Bonus!",
      body: `You hit ${EXECUTIVE_MILESTONE_TASKS} tasks today — a $${(EXECUTIVE_MILESTONE_BONUS_CENTS / 100).toFixed(2)} bonus has been credited to your wallet.`,
      link: "/dashboard/wallet",
    });
  }
}

// After the first 10 total approved tasks, introduce Combination VIP tasks with a 25% discount
async function checkFirstMilestone(workerId: string): Promise<void> {
  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: { firstMilestoneClaimed: true, gtmsPassActive: true },
  });

  // Only trigger once, and only if the pass hasn't already been purchased
  if (!worker || worker.firstMilestoneClaimed || worker.gtmsPassActive) return;

  const totalApproved = await db.submission.count({
    where: { workerId, status: { in: ["APPROVED", "AUTO_APPROVED"] } },
  });

  if (totalApproved < FIRST_MILESTONE_TASKS) return;

  const discountedPriceCents = Math.floor(GTMS_PASS_CENTS * (100 - FIRST_USER_DISCOUNT_PCT) / 100);

  await db.user.update({
    where: { id: workerId },
    data: {
      firstMilestoneClaimed: true,
      gtmsPassDiscountPct: FIRST_USER_DISCOUNT_PCT,
    },
  });

  await notify({
    userId: workerId,
    type: "COMBINATION_INTRO",
    title: "You've unlocked a special offer! 🎉",
    body:
      `You've completed your first ${FIRST_MILESTONE_TASKS} tasks — well done! ` +
      `Upgrade to Combination VIP tasks and earn 400% per task. ` +
      `Your exclusive ${FIRST_USER_DISCOUNT_PCT}% first-user discount brings the GTMS Pass down to $${(discountedPriceCents / 100).toFixed(2)}.`,
    link: "/dashboard/pass",
  });
}
