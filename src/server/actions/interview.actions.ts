"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { InterviewStatus } from "@prisma/client";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin schedules a virtual interview for an application. */
export async function scheduleInterviewAction(input: {
  applicationId: string;
  scheduledAt: string; // ISO from the form
  round: string;
  durationMins: number;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const when = new Date(input.scheduledAt);
  if (Number.isNaN(when.getTime())) return { error: "Pick a valid date and time." };
  try {
    const app = await db.jobApplication.findUnique({
      where: { id: input.applicationId },
      include: { job: true },
    });
    if (!app) return { error: "Application not found." };

    const meetingCode = randomUUID().slice(0, 8).toUpperCase();
    await db.interview.upsert({
      where: { applicationId: input.applicationId },
      update: {
        scheduledAt: when,
        round: input.round,
        durationMins: input.durationMins,
        status: "SCHEDULED",
        interviewerId: admin.id,
      },
      create: {
        applicationId: input.applicationId,
        scheduledAt: when,
        round: input.round,
        durationMins: input.durationMins,
        meetingCode,
        interviewerId: admin.id,
      },
    });
    await db.jobApplication.update({
      where: { id: input.applicationId },
      data: { status: "INTERVIEW" },
    });
    await notify(app.applicantId, "SYSTEM", "Interview scheduled", {
      body: `Your ${input.round} interview for "${app.job.title}" is scheduled for ${when.toLocaleString()}.`,
      link: "/interviews",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not schedule interview" };
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/interviews");
  return { ok: true };
}

/** Admin records the outcome of an interview. */
export async function completeInterviewAction(input: {
  interviewId: string;
  status: InterviewStatus;
  feedback?: string;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.interview.update({
      where: { id: input.interviewId },
      data: { status: input.status, feedback: input.feedback?.trim() || null },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update interview" };
  }
  revalidatePath("/admin/jobs");
  return { ok: true };
}

/** Employee confirms they attended (marks the room joined). Simulated. */
export async function markInterviewAttendedAction(interviewId: string): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: { application: true },
    });
    if (!interview || interview.application.applicantId !== user.id) {
      return { error: "Interview not found." };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update" };
  }
  revalidatePath("/interviews");
  return { ok: true };
}
