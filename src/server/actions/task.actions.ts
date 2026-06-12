"use server";

import { requireBusiness, requireWorker } from "@/server/rbac";
import {
  createTask,
  publishTask,
  cancelTask,
  pauseTask,
} from "@/server/services/task.service";
import {
  reserveUnit,
  abandonUnit,
  submitWork,
} from "@/server/services/assignment.service";
import { checkVelocity } from "@/server/services/fraud.service";
import { revalidatePath } from "next/cache";
import type { TaskCategory, MembershipTier, CareerLevel } from "@/generated/prisma";
import type { FieldDef } from "@/lib/fields";

export type TaskActionResult = { error?: string; success?: boolean; taskId?: string; assignmentId?: string };

export async function createTaskAction(
  _prev: TaskActionResult,
  formData: FormData
): Promise<TaskActionResult> {
  const user = await requireBusiness();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const instructions = formData.get("instructions") as string;
  const category = formData.get("category") as TaskCategory;
  const rewardStr = formData.get("rewardPerUnit") as string;
  const unitsStr = formData.get("totalUnits") as string;
  const fieldSchemaRaw = formData.get("fieldSchema") as string;

  if (!title || !category || !rewardStr || !unitsStr) {
    return { error: "Missing required fields" };
  }

  try {
    const fieldSchema: FieldDef[] = JSON.parse(fieldSchemaRaw || "[]");
    const task = await createTask({
      requesterId: user.id,
      title,
      description: description || "",
      instructions: instructions || "",
      category,
      fieldSchema,
      rewardPerUnitCents: Math.round(parseFloat(rewardStr) * 100),
      totalUnits: parseInt(unitsStr),
    });
    revalidatePath("/business/tasks");
    return { success: true, taskId: task.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create task" };
  }
}

export async function publishTaskAction(taskId: string): Promise<TaskActionResult> {
  const user = await requireBusiness();
  try {
    await publishTask(taskId, user.id);
    revalidatePath("/business/tasks");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to publish task" };
  }
}

export async function reserveTaskAction(taskId: string): Promise<TaskActionResult> {
  const user = await requireWorker();
  try {
    const assignment = await reserveUnit({ taskId, workerId: user.id });
    revalidatePath("/dashboard/browse");
    return { success: true, assignmentId: assignment.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to reserve task" };
  }
}

export async function abandonTaskAction(assignmentId: string): Promise<TaskActionResult> {
  const user = await requireWorker();
  try {
    await abandonUnit(assignmentId, user.id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to abandon task" };
  }
}

export async function submitWorkAction(
  _prev: TaskActionResult,
  formData: FormData
): Promise<TaskActionResult> {
  const user = await requireWorker();
  const assignmentId = formData.get("assignmentId") as string;
  const dataRaw = formData.get("data") as string;

  if (!assignmentId) return { error: "Assignment ID required" };

  try {
    await checkVelocity(user.id);
    const data = JSON.parse(dataRaw || "{}");
    await submitWork({ assignmentId, workerId: user.id, data });
    revalidatePath("/dashboard/submissions");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to submit work" };
  }
}
