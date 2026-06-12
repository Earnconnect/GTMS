import { db } from "@/server/db";
import { canAccessTask } from "@/lib/permissions";

export async function reserveUnit(params: {
  taskId: string;
  workerId: string;
}) {
  const { taskId, workerId } = params;

  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: {
      role: true,
      status: true,
      kycStatus: true,
      careerLevel: true,
      accuracyScore: true,
      gtmsPassActive: true,
      membership: { select: { tier: true, status: true } },
      certifications: {
        where: { status: "PASSED" },
        include: { certification: { select: { slug: true } } },
      },
    },
  });
  if (!worker) throw new Error("Worker not found");

  if (worker.status === "DORMANT") {
    throw new Error(
      "Your account is dormant due to a zero balance. Please deposit funds to reactivate."
    );
  }
  if (worker.status === "SUSPENDED" || worker.status === "BANNED") {
    throw new Error("Your account is not active.");
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      category: true,
      requiredMembershipTier: true,
      requiredCareerLevel: true,
      requiredCertifications: true,
      minAccuracyScore: true,
      rewardPerUnitCents: true,
      reservationTtlM: true,
      maxPerWorker: true,
      status: true,
    },
  });
  if (!task) throw new Error("Task not found");
  if (task.status !== "ACTIVE") throw new Error("Task is not active");

  const effectiveTier = worker.membership?.status === "ACTIVE"
    ? worker.membership.tier
    : "BASIC" as const;

  const access = canAccessTask(
    { ...worker, membershipTier: effectiveTier },
    task
  );
  if (!access.allowed) throw new Error(access.reason);

  // Check worker hasn't hit maxPerWorker limit
  const workerCount = await db.assignment.count({
    where: {
      taskId,
      workerId,
      status: { in: ["RESERVED", "SUBMITTED", "APPROVED"] },
    },
  });
  if (workerCount >= task.maxPerWorker) {
    throw new Error("You have reached the maximum units allowed for this task");
  }

  const expiresAt = new Date(Date.now() + task.reservationTtlM * 60 * 1000);

  const assignment = await db.$transaction(async (tx) => {
    const avail = await tx.assignment.findFirst({
      where: { taskId, status: "AVAILABLE" },
    });
    if (!avail) throw new Error("No available units for this task");

    return tx.assignment.update({
      where: { id: avail.id },
      data: {
        status: "RESERVED",
        workerId,
        reservedAt: new Date(),
        expiresAt,
      },
    });
  });

  return assignment;
}

export async function abandonUnit(assignmentId: string, workerId: string) {
  const a = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!a || a.workerId !== workerId) throw new Error("Assignment not found");
  if (a.status !== "RESERVED") throw new Error("Assignment is not reserved");

  return db.assignment.update({
    where: { id: assignmentId },
    data: { status: "AVAILABLE", workerId: null, reservedAt: null, expiresAt: null },
  });
}

export async function submitWork(params: {
  assignmentId: string;
  workerId: string;
  data: Record<string, unknown>;
}) {
  const { assignmentId, workerId, data } = params;

  const a = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { task: { select: { reviewWindowH: true, qaEnabled: true } } },
  });
  if (!a || a.workerId !== workerId) throw new Error("Assignment not found");
  if (a.status !== "RESERVED") throw new Error("Assignment is not reserved");

  const autoApproveAt = new Date(
    Date.now() + (a.task.reviewWindowH || 48) * 3600 * 1000
  );

  return db.$transaction(async (tx) => {
    const submission = await tx.submission.create({
      data: {
        assignmentId,
        workerId,
        data: data as never,
        status: "PENDING",
        autoApproveAt,
      },
    });

    await tx.assignment.update({
      where: { id: assignmentId },
      data: { status: "SUBMITTED" },
    });

    if (a.task.qaEnabled) {
      await tx.qaStageReview.create({
        data: {
          submissionId: submission.id,
          stage: "WORKER",
          status: "PASSED",
          completedAt: new Date(),
        },
      });
      await tx.qaStageReview.createMany({
        data: [
          { submissionId: submission.id, stage: "PEER_REVIEW", status: "PENDING" },
          { submissionId: submission.id, stage: "SENIOR_VERIFICATION", status: "PENDING" },
          { submissionId: submission.id, stage: "AI_AUDIT", status: "PENDING" },
          { submissionId: submission.id, stage: "FINAL_APPROVAL", status: "PENDING" },
        ],
      });
    }

    return submission;
  });
}

export async function expireReservations() {
  const now = new Date();
  const expired = await db.assignment.updateMany({
    where: { status: "RESERVED", expiresAt: { lt: now } },
    data: { status: "AVAILABLE", workerId: null, reservedAt: null, expiresAt: null },
  });
  return expired.count;
}

export async function getWorkerAssignments(workerId: string) {
  return db.assignment.findMany({
    where: { workerId },
    include: {
      task: { select: { title: true, category: true, rewardPerUnitCents: true } },
      submission: { select: { id: true, status: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
