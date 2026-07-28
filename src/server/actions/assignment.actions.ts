"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveUser, requireRole } from "@/server/rbac";
import {
  reserveUnit,
  reserveBatch,
  abandonUnit,
  submitWork,
} from "@/server/services/assignment.service";

export type FormState = { error?: string } | undefined;

/** Worker reserves a unit, then is sent to the work page. */
export async function reserveUnitAction(taskId: string): Promise<FormState> {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  let assignmentId: string | undefined;
  try {
    const assignment = await reserveUnit(taskId, user.id);
    assignmentId = assignment?.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not reserve a unit" };
  }
  if (assignmentId) redirect(`/work/${assignmentId}`);
  return { error: "No unit available" };
}

/** Worker reserves a combo (batch) of units, then is sent to the combo page. */
export async function reserveBatchAction(
  taskId: string,
  count: number,
): Promise<FormState> {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  try {
    await reserveBatch(taskId, user.id, count);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start combo" };
  }
  redirect(`/work/combo/${taskId}`);
}

/** Submit one unit within a combo session; returns ok without redirecting. */
export async function submitComboUnitAction(
  assignmentId: string,
  data: Record<string, unknown>,
): Promise<FormState> {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  try {
    await submitWork(assignmentId, user.id, data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit unit" };
  }
  revalidatePath("/submissions");
  return undefined;
}

export async function abandonUnitAction(assignmentId: string) {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  await abandonUnit(assignmentId, user.id);
  redirect("/browse");
}

export async function submitWorkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("WORKER");
  await requireActiveUser();

  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return { error: "Missing assignment" };

  // Collect all non-reserved form fields as the submission data.
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "assignmentId") continue;
    data[key] = value;
  }

  try {
    await submitWork(assignmentId, user.id, data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit work" };
  }

  revalidatePath("/submissions");
  redirect("/submissions?submitted=1");
}
