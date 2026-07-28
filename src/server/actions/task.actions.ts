"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { toCents } from "@/lib/money";
import { createTaskSchema } from "@/server/validators/task.schema";
import {
  createDraftTask,
  publishTask,
  pauseTask,
  cancelTask,
} from "@/server/services/task.service";

export type FormState = { error?: string } | undefined;

function safeJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function createTaskAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    instructions: formData.get("instructions"),
    category: formData.get("category"),
    rewardPerUnitCents: toCents(String(formData.get("reward") ?? "0")),
    maxPerWorker: Number(formData.get("maxPerWorker") ?? 1),
    reviewWindowH: Number(formData.get("reviewWindowH") ?? 72),
    reservationTtlM: Number(formData.get("reservationTtlM") ?? 30),
    fields: safeJson(formData.get("fields"), []),
    items: safeJson(formData.get("items"), []),
    unitCount: formData.get("unitCount")
      ? Number(formData.get("unitCount"))
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }

  const publishNow = formData.get("publishNow") === "true";

  let taskId: string;
  try {
    const { task } = await createDraftTask(user.id, parsed.data);
    taskId = task.id;
    if (publishNow) {
      await publishTask(task.id, user.id);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create task" };
  }

  revalidatePath("/requester/tasks");
  redirect(`/requester/tasks/${taskId}`);
}

export async function publishTaskAction(taskId: string): Promise<FormState> {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  try {
    await publishTask(taskId, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not publish task" };
  }
  revalidatePath(`/requester/tasks/${taskId}`);
  return undefined;
}

export async function pauseTaskAction(taskId: string, pause: boolean) {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  await pauseTask(taskId, user.id, pause);
  revalidatePath(`/requester/tasks/${taskId}`);
}

export async function cancelTaskAction(taskId: string) {
  const user = await requireRole("REQUESTER");
  await requireActiveUser();
  await cancelTask(taskId, user.id);
  revalidatePath(`/requester/tasks/${taskId}`);
}
