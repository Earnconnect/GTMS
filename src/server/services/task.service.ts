import { db } from "@/server/db";
import type { TaskCategory, MembershipTier, CareerLevel } from "@/generated/prisma";
import type { FieldDef } from "@/lib/fields";

export interface BrowseTasksParams {
  category?: TaskCategory;
  tier?: MembershipTier;
  workerId?: string;
  page?: number;
  pageSize?: number;
}

export async function browseTasks(params: BrowseTasksParams = {}) {
  const { category, tier, page = 1, pageSize = 20 } = params;

  const where = {
    status: "ACTIVE" as const,
    ...(category ? { category } : {}),
    ...(tier ? { requiredMembershipTier: tier } : {}),
    assignments: {
      some: { status: "AVAILABLE" as const },
    },
  };

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      include: {
        requester: { select: { name: true, id: true } },
        _count: {
          select: {
            assignments: { where: { status: "AVAILABLE" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.task.count({ where }),
  ]);

  return { tasks, total, page, pageSize };
}

export async function getTask(taskId: string) {
  return db.task.findUnique({
    where: { id: taskId },
    include: {
      requester: { select: { name: true, id: true } },
      _count: {
        select: {
          assignments: true,
          assignments_AVAILABLE: { where: { status: "AVAILABLE" } },
        } as never,
      },
    },
  });
}

export async function getTaskWithCounts(taskId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return null;

  const [available, total, approved] = await Promise.all([
    db.assignment.count({ where: { taskId, status: "AVAILABLE" } }),
    db.assignment.count({ where: { taskId } }),
    db.assignment.count({ where: { taskId, status: "APPROVED" } }),
  ]);

  return { ...task, available, total, approved };
}

export interface CreateTaskParams {
  requesterId: string;
  title: string;
  description: string;
  instructions: string;
  category: TaskCategory;
  fieldSchema: FieldDef[];
  rewardPerUnitCents: number;
  totalUnits: number;
  maxPerWorker?: number;
  reviewWindowH?: number;
  reservationTtlM?: number;
  requiredCertifications?: string[];
  requiredCareerLevel?: CareerLevel;
  requiredMembershipTier?: MembershipTier;
  minAccuracyScore?: number;
  qaEnabled?: boolean;
}

export async function createTask(params: CreateTaskParams) {
  const {
    requesterId,
    totalUnits,
    fieldSchema,
    ...rest
  } = params;

  const task = await db.task.create({
    data: {
      requesterId,
      fieldSchema: fieldSchema as never,
      totalUnits,
      ...rest,
      status: "DRAFT",
    },
  });

  await db.assignment.createMany({
    data: Array.from({ length: totalUnits }, (_, i) => ({
      taskId: task.id,
      unitIndex: i,
      status: "AVAILABLE" as const,
    })),
  });

  return task;
}

export async function publishTask(taskId: string, requesterId: string) {
  return db.task.update({
    where: { id: taskId, requesterId },
    data: { status: "ACTIVE" },
  });
}

export async function pauseTask(taskId: string, requesterId: string) {
  return db.task.update({
    where: { id: taskId, requesterId },
    data: { status: "PAUSED" },
  });
}

export async function cancelTask(taskId: string, requesterId: string) {
  return db.task.update({
    where: { id: taskId, requesterId },
    data: { status: "CANCELLED" },
  });
}

export async function getTasksByRequester(requesterId: string) {
  return db.task.findMany({
    where: { requesterId },
    include: {
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
