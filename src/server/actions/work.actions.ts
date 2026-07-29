"use server";

import { revalidatePath } from "next/cache";
import type { WorkStatus } from "@prisma/client";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin assigns a job for an employee to start working on. */
export async function assignJobAction(input: {
  employeeId: string;
  jobId?: string;
  title: string;
  brief: string;
  dueAt?: string;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const title = input.title.trim();
  const brief = input.brief.trim();
  if (!input.employeeId) return { error: "Choose an employee." };
  if (!title || !brief) return { error: "Title and brief are required." };
  try {
    const due = input.dueAt ? new Date(input.dueAt) : null;
    await db.jobAssignment.create({
      data: {
        employeeId: input.employeeId,
        jobId: input.jobId || null,
        title,
        brief,
        dueAt: due && !Number.isNaN(due.getTime()) ? due : null,
        assignedById: admin.id,
      },
    });
    await notify(input.employeeId, "SYSTEM", "New assignment", {
      body: `You've been assigned: ${title}. Open it to get started.`,
      link: "/assignments",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not assign job" };
  }
  revalidatePath("/admin/assignments");
  revalidatePath("/assignments");
  return { ok: true };
}

/** Employee starts an assigned job. */
export async function startAssignmentAction(assignmentId: string): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    const a = await db.jobAssignment.findUnique({ where: { id: assignmentId } });
    if (!a || a.employeeId !== user.id) return { error: "Assignment not found." };
    if (a.status !== "ASSIGNED") return { error: "This assignment has already been started." };
    await db.jobAssignment.update({
      where: { id: assignmentId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start assignment" };
  }
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/assignments");
  return { ok: true };
}

/** Employee submits their completed work for review. */
export async function submitAssignmentAction(input: {
  assignmentId: string;
  note: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  const note = input.note.trim();
  if (!note) return { error: "Add a short summary of the work you completed." };
  try {
    const a = await db.jobAssignment.findUnique({ where: { id: input.assignmentId } });
    if (!a || a.employeeId !== user.id) return { error: "Assignment not found." };
    if (a.status !== "IN_PROGRESS" && a.status !== "ASSIGNED") {
      return { error: "This assignment can't be submitted right now." };
    }
    await db.jobAssignment.update({
      where: { id: input.assignmentId },
      data: { status: "SUBMITTED", submittedAt: new Date(), submissionNote: note, startedAt: a.startedAt ?? new Date() },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit assignment" };
  }
  revalidatePath(`/assignments/${input.assignmentId}`);
  revalidatePath("/assignments");
  revalidatePath("/admin/assignments");
  return { ok: true };
}

/** Admin reviews a submitted assignment: approve (complete) or send back. */
export async function reviewAssignmentAction(input: {
  assignmentId: string;
  status: Extract<WorkStatus, "COMPLETED" | "IN_PROGRESS">;
  reviewNote?: string;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    const a = await db.jobAssignment.update({
      where: { id: input.assignmentId },
      data: {
        status: input.status,
        reviewNote: input.reviewNote?.trim() || null,
        completedAt: input.status === "COMPLETED" ? new Date() : null,
      },
    });
    await notify(
      a.employeeId,
      "SYSTEM",
      input.status === "COMPLETED" ? "Assignment approved" : "Changes requested",
      {
        body:
          input.status === "COMPLETED"
            ? `Your work on "${a.title}" was approved.`
            : `"${a.title}" was sent back${input.reviewNote ? `: ${input.reviewNote}` : "."}`,
        link: "/assignments",
      },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not review assignment" };
  }
  revalidatePath("/admin/assignments");
  return { ok: true };
}
