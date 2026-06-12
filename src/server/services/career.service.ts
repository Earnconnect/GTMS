import { db } from "@/server/db";
import { CAREER_REQUIREMENTS, levelOrdinal, nextLevel } from "@/lib/career";
import type { CareerLevel } from "@/generated/prisma";
import { notify } from "@/server/services/notification.service";

export async function promoteIfEligible(workerId: string): Promise<CareerLevel | null> {
  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: {
      careerLevel: true,
      accuracyScore: true,
      trustScore: true,
      _count: { select: { workerSubs: { where: { status: { in: ["APPROVED", "AUTO_APPROVED"] } } } } },
    },
  });
  if (!worker) return null;

  const next = nextLevel(worker.careerLevel);
  if (!next) return null;

  const req = CAREER_REQUIREMENTS[next];
  const tasksCompleted = worker._count.workerSubs;

  if (
    tasksCompleted >= req.tasksCompleted &&
    worker.accuracyScore >= req.accuracyScore &&
    worker.trustScore >= req.trustScore
  ) {
    await db.user.update({ where: { id: workerId }, data: { careerLevel: next } });

    await notify({
      userId: workerId,
      type: "LEVEL_UP",
      title: "Level Up!",
      body: `Congratulations! You've been promoted to ${CAREER_REQUIREMENTS[next].label}.`,
      link: "/dashboard/career",
    });

    return next;
  }

  return null;
}

export async function getCareerProgress(workerId: string) {
  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: {
      careerLevel: true,
      accuracyScore: true,
      trustScore: true,
      _count: { select: { workerSubs: { where: { status: { in: ["APPROVED", "AUTO_APPROVED"] } } } } },
    },
  });
  if (!worker) return null;

  const next = nextLevel(worker.careerLevel);
  if (!next) return { current: worker.careerLevel, next: null, progress: 100 };

  const req = CAREER_REQUIREMENTS[next];
  const tasksCompleted = worker._count.workerSubs;

  const taskPct = Math.min(100, (tasksCompleted / req.tasksCompleted) * 100);
  const accuracyPct = Math.min(100, (worker.accuracyScore / req.accuracyScore) * 100);
  const trustPct = Math.min(100, (worker.trustScore / req.trustScore) * 100);
  const overallProgress = Math.floor((taskPct + accuracyPct + trustPct) / 3);

  return {
    current: worker.careerLevel,
    next,
    nextReqs: req,
    tasksCompleted,
    accuracyScore: worker.accuracyScore,
    trustScore: worker.trustScore,
    progress: overallProgress,
  };
}
