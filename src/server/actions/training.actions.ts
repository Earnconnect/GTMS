"use server";

import { revalidatePath } from "next/cache";
import type { TrainingLevel } from "@prisma/client";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";

export type ActionResult = { error?: string; ok?: boolean };

/** Employee enrolls in a bootcamp/training course. */
export async function enrollCourseAction(courseId: string): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    const course = await db.trainingCourse.findUnique({ where: { id: courseId } });
    if (!course || !course.published) return { error: "Course not available." };
    await db.trainingEnrollment.upsert({
      where: { courseId_userId: { courseId, userId: user.id } },
      update: {},
      create: { courseId, userId: user.id, status: "ENROLLED", progressPct: 0 },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not enroll" };
  }
  revalidatePath("/training");
  return { ok: true };
}

/** Employee updates their progress in a course (simulated module completion). */
export async function updateProgressAction(input: {
  enrollmentId: string;
  progressPct: number;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  const pct = Math.max(0, Math.min(100, Math.round(input.progressPct)));
  try {
    const enr = await db.trainingEnrollment.findUnique({ where: { id: input.enrollmentId } });
    if (!enr || enr.userId !== user.id) return { error: "Enrollment not found." };
    await db.trainingEnrollment.update({
      where: { id: input.enrollmentId },
      data: {
        progressPct: pct,
        status: pct >= 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "ENROLLED",
        completedAt: pct >= 100 ? new Date() : null,
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update progress" };
  }
  revalidatePath("/training");
  return { ok: true };
}

/**
 * Employee completes a single module. Progress is recomputed from actual
 * completed modules — no more fake percentage bumping.
 */
export async function completeModuleAction(input: {
  courseId: string;
  moduleId: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    const course = await db.trainingCourse.findUnique({
      where: { id: input.courseId },
      include: { modules: true },
    });
    if (!course) return { error: "Course not found." };

    const enrollment = await db.trainingEnrollment.upsert({
      where: { courseId_userId: { courseId: input.courseId, userId: user.id } },
      update: {},
      create: { courseId: input.courseId, userId: user.id },
    });

    await db.moduleCompletion.upsert({
      where: { moduleId_enrollmentId: { moduleId: input.moduleId, enrollmentId: enrollment.id } },
      update: {},
      create: { moduleId: input.moduleId, enrollmentId: enrollment.id },
    });

    const done = await db.moduleCompletion.count({ where: { enrollmentId: enrollment.id } });
    const total = Math.max(course.modules.length, 1);
    const pct = Math.min(100, Math.round((done / total) * 100));
    const complete = done >= total;
    await db.trainingEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPct: pct,
        status: complete ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "ENROLLED",
        completedAt: complete ? new Date() : null,
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update progress" };
  }
  revalidatePath(`/training/${input.courseId}`);
  revalidatePath("/training");
  return { ok: true };
}

/** Admin creates a training course. */
export async function createCourseAction(input: {
  title: string;
  summary: string;
  category: string;
  level: TrainingLevel;
  durationHours: number;
  moduleCount: number;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  if (!input.title.trim() || !input.summary.trim()) return { error: "Title and summary are required." };
  try {
    await db.trainingCourse.create({
      data: {
        title: input.title.trim(),
        summary: input.summary.trim(),
        category: input.category.trim() || "General",
        level: input.level,
        durationHours: Math.max(1, input.durationHours),
        moduleCount: Math.max(1, input.moduleCount),
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create course" };
  }
  revalidatePath("/admin/training");
  revalidatePath("/training");
  return { ok: true };
}
