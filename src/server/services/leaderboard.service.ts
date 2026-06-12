import { db } from "@/server/db";
import type { LeaderboardPeriod } from "@/generated/prisma";

export async function snapshotLeaderboard(period: LeaderboardPeriod) {
  let fromDate: Date | undefined;
  const now = new Date();

  if (period === "WEEKLY") {
    fromDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  } else if (period === "MONTHLY") {
    fromDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  }

  let workers: Array<{
    workerId: string;
    earningsCents: number;
    tasksCompleted: number;
  }>;

  if (period === "ALL_TIME") {
    const users = await db.user.findMany({
      where: { role: "WORKER", totalEarnedCents: { gt: 0 } },
      select: {
        id: true,
        totalEarnedCents: true,
        _count: { select: { workerSubs: { where: { status: { in: ["APPROVED", "AUTO_APPROVED"] } } } } },
      },
      orderBy: { totalEarnedCents: "desc" },
      take: 100,
    });
    workers = users.map((u) => ({
      workerId: u.id,
      earningsCents: u.totalEarnedCents,
      tasksCompleted: u._count.workerSubs,
    }));
  } else {
    const txns = await db.transaction.findMany({
      where: {
        type: "EARNING",
        status: "COMPLETED",
        ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
      },
      select: {
        amountCents: true,
        wallet: { select: { userId: true } },
      },
    });

    const map = new Map<string, number>();
    for (const t of txns) {
      const uid = t.wallet.userId;
      map.set(uid, (map.get(uid) ?? 0) + t.amountCents);
    }

    const taskCounts = await db.submission.groupBy({
      by: ["workerId"],
      where: {
        status: { in: ["APPROVED", "AUTO_APPROVED"] },
        ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
      },
      _count: { workerId: true },
    });

    const tcMap = new Map(taskCounts.map((t) => [t.workerId, t._count.workerId]));

    workers = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([workerId, earningsCents]) => ({
        workerId,
        earningsCents,
        tasksCompleted: tcMap.get(workerId) ?? 0,
      }));
  }

  const snapshotDate = new Date(now.setHours(0, 0, 0, 0));

  const workerIds = workers.map((w) => w.workerId);
  const accuracies = await db.user.findMany({
    where: { id: { in: workerIds } },
    select: { id: true, accuracyScore: true },
  });
  const accMap = new Map(accuracies.map((u) => [u.id, u.accuracyScore]));

  await db.$transaction(
    workers.map((w, i) =>
      db.leaderboardSnapshot.upsert({
        where: { period_workerId_snapshotDate: { period, workerId: w.workerId, snapshotDate } },
        create: {
          period,
          workerId: w.workerId,
          rank: i + 1,
          earningsCents: w.earningsCents,
          accuracyScore: accMap.get(w.workerId) ?? 0,
          tasksCompleted: w.tasksCompleted,
          snapshotDate,
        },
        update: {
          rank: i + 1,
          earningsCents: w.earningsCents,
          accuracyScore: accMap.get(w.workerId) ?? 0,
          tasksCompleted: w.tasksCompleted,
        },
      })
    )
  );

  return workers.length;
}

export async function getLeaderboard(period: LeaderboardPeriod, limit = 50) {
  if (period === "ALL_TIME") {
    return db.user.findMany({
      where: { role: "WORKER", totalEarnedCents: { gt: 0 } },
      select: {
        id: true,
        name: true,
        image: true,
        careerLevel: true,
        totalEarnedCents: true,
        accuracyScore: true,
      },
      orderBy: { totalEarnedCents: "desc" },
      take: limit,
    });
  }

  const latest = await db.leaderboardSnapshot.findFirst({
    where: { period },
    orderBy: { snapshotDate: "desc" },
    select: { snapshotDate: true },
  });

  if (!latest) return [];

  return db.leaderboardSnapshot.findMany({
    where: { period, snapshotDate: latest.snapshotDate },
    orderBy: { rank: "asc" },
    take: limit,
  });
}
