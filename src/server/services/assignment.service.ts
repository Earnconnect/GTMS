import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { notify } from "./notification.service";
import { parseFieldSchema, buildSubmissionSchema } from "@/lib/fields";
import { COMBO_MAX_UNITS } from "@/lib/constants";

export class AssignmentError extends Error {}

/** Remaining units a worker may still take on a task (cap minus already held). */
async function remainingAllowance(
  taskId: string,
  workerId: string,
  maxPerWorker: number,
): Promise<number> {
  const held = await db.assignment.count({
    where: {
      taskId,
      workerId,
      status: { in: ["RESERVED", "SUBMITTED", "APPROVED"] },
    },
  });
  return Math.max(0, maxPerWorker - held);
}

/** Try to atomically reserve one AVAILABLE unit; returns its id or null. */
async function tryReserveOne(
  taskId: string,
  workerId: string,
  ttlMs: number,
): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await db.assignment.findFirst({
      where: { taskId, status: "AVAILABLE" },
      orderBy: { unitIndex: "asc" },
    });
    if (!candidate) return null;
    const now = new Date();
    const res = await db.assignment.updateMany({
      where: { id: candidate.id, status: "AVAILABLE" },
      data: {
        status: "RESERVED",
        workerId,
        reservedAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
      },
    });
    if (res.count === 1) return candidate.id;
  }
  return null;
}

/**
 * Combo (batch) reservation: reserve up to `count` AVAILABLE units of a task in
 * one go, so a worker can complete several in a single sitting. Capped by
 * COMBO_MAX_UNITS, the task's per-worker limit, and current availability.
 *
 * This is purely a throughput convenience: reward is just the sum of the normal
 * per-unit rewards, each unit is still reviewed individually, and NOTHING about
 * it requires the worker to pay, deposit, or "unlock" anything.
 */
export async function reserveBatch(
  taskId: string,
  workerId: string,
  count: number,
): Promise<string[]> {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AssignmentError("Task not found");
  if (task.status !== "ACTIVE") throw new AssignmentError("Task is not active");

  const allowance = await remainingAllowance(taskId, workerId, task.maxPerWorker);
  const target = Math.min(count, COMBO_MAX_UNITS, allowance);
  if (target <= 0) {
    throw new AssignmentError(
      `You've reached the limit of ${task.maxPerWorker} unit(s) for this task.`,
    );
  }

  const ttlMs = task.reservationTtlM * 60_000;
  const ids: string[] = [];
  for (let i = 0; i < target; i++) {
    const id = await tryReserveOne(taskId, workerId, ttlMs);
    if (!id) break; // ran out of available units
    ids.push(id);
  }

  if (ids.length === 0) {
    throw new AssignmentError("No units are currently available.");
  }
  return ids;
}

/**
 * Reserve one AVAILABLE unit of a task for a worker. Uses a guarded updateMany
 * (status=AVAILABLE) so two workers can never grab the same unit. Retries a few
 * times if it loses the race for a particular row.
 */
export async function reserveUnit(taskId: string, workerId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AssignmentError("Task not found");
  if (task.status !== "ACTIVE") throw new AssignmentError("Task is not active");

  // Enforce per-worker cap across non-rejected/expired states.
  const held = await db.assignment.count({
    where: {
      taskId,
      workerId,
      status: { in: ["RESERVED", "SUBMITTED", "APPROVED"] },
    },
  });
  if (held >= task.maxPerWorker) {
    throw new AssignmentError(
      `You've reached the limit of ${task.maxPerWorker} unit(s) for this task.`,
    );
  }

  const ttlMs = task.reservationTtlM * 60_000;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await db.assignment.findFirst({
      where: { taskId, status: "AVAILABLE" },
      orderBy: { unitIndex: "asc" },
    });
    if (!candidate) throw new AssignmentError("No units are currently available.");

    const now = new Date();
    const res = await db.assignment.updateMany({
      where: { id: candidate.id, status: "AVAILABLE" },
      data: {
        status: "RESERVED",
        workerId,
        reservedAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
      },
    });
    if (res.count === 1) {
      return db.assignment.findUnique({ where: { id: candidate.id } });
    }
    // lost the race — try the next available unit
  }

  throw new AssignmentError("Could not reserve a unit, please try again.");
}

/** Release a reserved unit back to the pool (worker changed their mind). */
export async function abandonUnit(assignmentId: string, workerId: string) {
  const res = await db.assignment.updateMany({
    where: { id: assignmentId, workerId, status: "RESERVED" },
    data: { status: "AVAILABLE", workerId: null, reservedAt: null, expiresAt: null },
  });
  if (res.count === 0) throw new AssignmentError("Unit is not reserved by you.");
}

/**
 * Submit a worker's deliverable for a reserved unit. Validates the data against
 * the task's field schema, creates a PENDING submission with an auto-approve
 * deadline, and flips the unit to SUBMITTED.
 */
export async function submitWork(
  assignmentId: string,
  workerId: string,
  rawData: Record<string, unknown>,
) {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { task: true },
  });
  if (!assignment) throw new AssignmentError("Assignment not found");
  if (assignment.workerId !== workerId || assignment.status !== "RESERVED") {
    throw new AssignmentError("This unit is not reserved by you.");
  }
  if (assignment.expiresAt && assignment.expiresAt < new Date()) {
    throw new AssignmentError("Your reservation has expired. Please reserve again.");
  }

  const schema = parseFieldSchema(assignment.task.fieldSchema);
  const parsed = buildSubmissionSchema(schema.fields).safeParse(rawData);
  if (!parsed.success) {
    throw new AssignmentError(
      parsed.error.issues[0]?.message ?? "Invalid submission data",
    );
  }

  const autoApproveAt = new Date(
    Date.now() + assignment.task.reviewWindowH * 3_600_000,
  );

  const submission = await db.$transaction(async (tx) => {
    const sub = await tx.submission.create({
      data: {
        assignmentId,
        workerId,
        data: parsed.data as unknown as Prisma.InputJsonValue,
        status: "PENDING",
        autoApproveAt,
      },
    });
    await tx.assignment.update({
      where: { id: assignmentId },
      data: { status: "SUBMITTED" },
    });
    await notify(
      assignment.task.requesterId,
      "ASSIGNMENT_SUBMITTED",
      `New submission for "${assignment.task.title}"`,
      {
        body: "A worker submitted a unit for review.",
        link: `/requester/tasks/${assignment.taskId}/review`,
        tx,
      },
    );
    return sub;
  });

  return submission;
}

/** Cron helper: return expired reservations to the pool. */
export async function expireReservations() {
  const res = await db.assignment.updateMany({
    where: { status: "RESERVED", expiresAt: { lt: new Date() } },
    data: { status: "AVAILABLE", workerId: null, reservedAt: null, expiresAt: null },
  });
  return res.count;
}
