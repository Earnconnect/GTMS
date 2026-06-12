import { db } from "@/server/db";
import {
  computeAccuracy,
  computeSpeed,
  computeConsistency,
  computeTrust,
} from "@/lib/scores";

const NINETY_DAYS = 90 * 24 * 3600 * 1000;
const THIRTY_DAYS = 30 * 24 * 3600 * 1000;

export async function recomputeScores(workerId: string) {
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS);

  const [recentSubs, user] = await Promise.all([
    db.submission.findMany({
      where: {
        workerId,
        createdAt: { gte: ninetyDaysAgo },
        status: { in: ["APPROVED", "AUTO_APPROVED", "REJECTED"] },
      },
      select: {
        status: true,
        createdAt: true,
        assignment: { select: { reservedAt: true } },
      },
    }),
    db.user.findUnique({ where: { id: workerId }, select: { createdAt: true } }),
  ]);

  if (!user) return;

  const approved = recentSubs.filter(
    (s) => s.status === "APPROVED" || s.status === "AUTO_APPROVED"
  ).length;
  const rejected = recentSubs.filter((s) => s.status === "REJECTED").length;
  const accuracyScore = computeAccuracy(approved, rejected);

  const completionTimes = recentSubs
    .filter(
      (s) =>
        (s.status === "APPROVED" || s.status === "AUTO_APPROVED") &&
        s.assignment?.reservedAt
    )
    .map((s) =>
      s.createdAt.getTime() - s.assignment!.reservedAt!.getTime()
    )
    .filter((t) => t > 0);

  let speedScore = 50;
  if (completionTimes.length > 0) {
    completionTimes.sort((a, b) => a - b);
    const medianIdx = Math.floor(completionTimes.length / 2);
    const median = completionTimes[medianIdx];
    const avgTime =
      completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
    speedScore = computeSpeed(avgTime, median);
  }

  const thirtyDaySubs = recentSubs.filter(
    (s) => s.createdAt >= thirtyDaysAgo
  );
  const windowAccuracies: number[] = [];
  if (thirtyDaySubs.length >= 5) {
    const chunkSize = Math.max(5, Math.floor(thirtyDaySubs.length / 4));
    for (let i = 0; i < thirtyDaySubs.length; i += chunkSize) {
      const chunk = thirtyDaySubs.slice(i, i + chunkSize);
      const chunkApproved = chunk.filter(
        (s) => s.status === "APPROVED" || s.status === "AUTO_APPROVED"
      ).length;
      const chunkRejected = chunk.filter((s) => s.status === "REJECTED").length;
      windowAccuracies.push(computeAccuracy(chunkApproved, chunkRejected));
    }
  }
  const consistencyScore = computeConsistency(windowAccuracies);

  const accountAgeDays = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 3600 * 24)
  );
  const trustScore = computeTrust(
    accuracyScore,
    speedScore,
    consistencyScore,
    accountAgeDays
  );

  await db.user.update({
    where: { id: workerId },
    data: { accuracyScore, speedScore, consistencyScore, trustScore },
  });

  return { accuracyScore, speedScore, consistencyScore, trustScore };
}
