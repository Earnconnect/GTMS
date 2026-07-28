import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { getOrCreateWallet, WalletError } from "./wallet.service";
import { createHold, refundRemaining } from "./escrow.service";
import { notify } from "./notification.service";
import { feeFromBps } from "@/lib/money";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import type { CreateTaskInput } from "@/server/validators/task.schema";

/** Per-unit gross escrow = worker reward + platform fee. */
export function grossPerUnit(rewardPerUnitCents: number): number {
  return rewardPerUnitCents + feeFromBps(rewardPerUnitCents, PLATFORM_FEE_BPS);
}

export async function createDraftTask(requesterId: string, input: CreateTaskInput) {
  const totalUnits =
    input.items.length > 0 ? input.items.length : input.unitCount ?? 1;

  const task = await db.task.create({
    data: {
      requesterId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      category: input.category,
      fieldSchema: { fields: input.fields } as unknown as Prisma.InputJsonValue,
      rewardPerUnit: input.rewardPerUnitCents,
      totalUnits,
      draftItems: input.items as unknown as Prisma.InputJsonValue,
      maxPerWorker: input.maxPerWorker,
      reviewWindowH: input.reviewWindowH,
      reservationTtlM: input.reservationTtlM,
      status: "DRAFT",
    },
  });

  return { task, items: input.items };
}

/**
 * Publish a draft: lock escrow for reward+fee across all units, then generate
 * the AVAILABLE assignment rows. Atomic.
 */
export async function publishTask(taskId: string, requesterId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new WalletError("Task not found");
  if (task.requesterId !== requesterId) throw new WalletError("Not your task");
  if (task.status !== "DRAFT") throw new WalletError("Task is not a draft");

  const items = (task.draftItems as Array<Record<string, unknown>> | null) ?? [];

  const wallet = await getOrCreateWallet(requesterId);
  const amountTotal = grossPerUnit(task.rewardPerUnit) * task.totalUnits;
  if (amountTotal > wallet.balance) {
    throw new WalletError(
      "Insufficient balance to fund this task. Add funds first.",
    );
  }

  await db.$transaction(async (tx) => {
    const hold = await createHold(tx, wallet.id, amountTotal, "TASK", taskId);

    await tx.task.update({
      where: { id: taskId },
      data: { status: "ACTIVE", escrowHoldId: hold.id, draftItems: Prisma.DbNull },
    });

    await tx.assignment.createMany({
      data: Array.from({ length: task.totalUnits }, (_, i) => ({
        taskId,
        unitIndex: i,
        inputData: (items[i] ?? null) as Prisma.InputJsonValue,
        status: "AVAILABLE" as const,
      })),
    });

    await notify(requesterId, "TASK_FUNDED", `Task "${task.title}" is live`, {
      body: `${task.totalUnits} units funded and available to workers.`,
      link: `/requester/tasks/${taskId}`,
      tx,
    });
  });

  return db.task.findUnique({ where: { id: taskId } });
}

export async function pauseTask(taskId: string, requesterId: string, pause: boolean) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || task.requesterId !== requesterId) throw new WalletError("Not your task");
  if (pause && task.status !== "ACTIVE") throw new WalletError("Task is not active");
  if (!pause && task.status !== "PAUSED") throw new WalletError("Task is not paused");
  return db.task.update({
    where: { id: taskId },
    data: { status: pause ? "PAUSED" : "ACTIVE" },
  });
}

/**
 * Cancel a task: refund escrow for all units that were never worked, and mark
 * remaining AVAILABLE/RESERVED units EXPIRED. Submitted/approved units stand.
 */
export async function cancelTask(taskId: string, requesterId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || task.requesterId !== requesterId) throw new WalletError("Not your task");
  if (["COMPLETED", "CANCELLED", "EXPIRED"].includes(task.status)) {
    throw new WalletError("Task already closed");
  }
  const wallet = await getOrCreateWallet(requesterId);

  await db.$transaction(async (tx) => {
    await tx.assignment.updateMany({
      where: { taskId, status: { in: ["AVAILABLE", "RESERVED"] } },
      data: { status: "EXPIRED", workerId: null },
    });
    if (task.escrowHoldId) {
      await refundRemaining(tx, task.escrowHoldId, wallet.id, "TASK", taskId);
    }
    await tx.task.update({ where: { id: taskId }, data: { status: "CANCELLED" } });
  });

  return db.task.findUnique({ where: { id: taskId } });
}

/**
 * If every assignment for a task is in a terminal state, refund any unused
 * escrow and mark the task COMPLETED. Safe to call after each review.
 */
export async function completeIfDone(taskId: string) {
  const remaining = await db.assignment.count({
    where: { taskId, status: { in: ["AVAILABLE", "RESERVED", "SUBMITTED"] } },
  });
  if (remaining > 0) return;

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || task.status === "COMPLETED" || task.status === "CANCELLED") return;
  const wallet = await getOrCreateWallet(task.requesterId);

  await db.$transaction(async (tx) => {
    if (task.escrowHoldId) {
      await refundRemaining(tx, task.escrowHoldId, wallet.id, "TASK", taskId);
    }
    await tx.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
  });
}

export interface BrowseFilters {
  q?: string;
  category?: string;
  minRewardCents?: number;
  sort?: "newest" | "reward";
}

/** Tasks a worker can browse — ACTIVE tasks with at least one AVAILABLE unit. */
export async function browseTasks(filters: BrowseFilters) {
  const where: Prisma.TaskWhereInput = {
    status: "ACTIVE",
    assignments: { some: { status: "AVAILABLE" } },
  };
  if (filters.category) where.category = filters.category;
  if (filters.minRewardCents) where.rewardPerUnit = { gte: filters.minRewardCents };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return db.task.findMany({
    where,
    orderBy:
      filters.sort === "reward"
        ? { rewardPerUnit: "desc" }
        : { createdAt: "desc" },
    include: {
      requester: { select: { name: true, ratingAvg: true } },
      _count: { select: { assignments: true } },
    },
    take: 100,
  });
}
