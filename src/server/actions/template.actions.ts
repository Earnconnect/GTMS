"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin creates a new assignment catalog template. */
export async function createTemplateAction(input: {
  title: string;
  brief: string;
  role: string;
  department?: string;
  difficulty: string;
  estimatedHours: number;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  const title = input.title.trim();
  const brief = input.brief.trim();
  if (!title || !brief) return { error: "Title and brief are required." };
  try {
    await db.assignmentTemplate.create({
      data: {
        title,
        brief,
        role: input.role.trim() || "General",
        department: input.department?.trim() || null,
        difficulty: ["Easy", "Medium", "Hard"].includes(input.difficulty) ? input.difficulty : "Medium",
        estimatedHours: Math.max(1, Math.round(input.estimatedHours)),
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create template" };
  }
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/assignments");
  return { ok: true };
}

/** Admin activates/deactivates a template (deactivated ones are hidden from assign). */
export async function setTemplateActiveAction(id: string, active: boolean): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.assignmentTemplate.update({ where: { id }, data: { active } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update template" };
  }
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/assignments");
  return { ok: true };
}
