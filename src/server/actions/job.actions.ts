"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationStatus, JobStatus, JobType } from "@prisma/client";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin creates a job posting. */
export async function createJobAction(input: {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  responsibilities?: string;
  salaryMinCents?: number;
  salaryMaxCents?: number;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  if (!input.title.trim() || !input.department.trim() || !input.description.trim()) {
    return { error: "Title, department, and description are required." };
  }
  try {
    await db.jobPosting.create({
      data: {
        title: input.title.trim(),
        department: input.department.trim(),
        location: input.location.trim() || "Remote",
        type: input.type,
        description: input.description.trim(),
        responsibilities: input.responsibilities?.trim() || null,
        salaryMinCents: input.salaryMinCents || null,
        salaryMaxCents: input.salaryMaxCents || null,
        status: "OPEN",
        postedById: admin.id,
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create job" };
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { ok: true };
}

export async function setJobStatusAction(jobId: string, status: JobStatus): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.jobPosting.update({ where: { id: jobId }, data: { status } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update job" };
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { ok: true };
}

/** Employee applies to an open job placement. */
export async function applyToJobAction(input: { jobId: string; coverNote?: string }): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    const job = await db.jobPosting.findUnique({ where: { id: input.jobId } });
    if (!job || job.status !== "OPEN") return { error: "This role is not open for applications." };
    const existing = await db.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId: input.jobId, applicantId: user.id } },
    });
    if (existing) return { error: "You have already applied to this role." };
    await db.jobApplication.create({
      data: { jobId: input.jobId, applicantId: user.id, coverNote: input.coverNote?.trim() || null },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not apply" };
  }
  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  return { ok: true };
}

/** Admin advances an application through the pipeline. */
export async function decideApplicationAction(input: {
  applicationId: string;
  status: ApplicationStatus;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  try {
    const app = await db.jobApplication.update({
      where: { id: input.applicationId },
      data: { status: input.status, decidedById: admin.id, decidedAt: new Date() },
      include: { job: true },
    });
    await notify(app.applicantId, "SYSTEM", "Application update", {
      body: `Your application for "${app.job.title}" is now ${input.status.replace("_", " ").toLowerCase()}.`,
      link: "/jobs",
    });

    // On placement, create a work assignment so the employee has something to
    // start doing — unless one already exists for this job.
    if (input.status === "PLACED") {
      const existing = await db.jobAssignment.findFirst({
        where: { employeeId: app.applicantId, jobId: app.jobId },
      });
      if (!existing) {
        await db.jobAssignment.create({
          data: {
            employeeId: app.applicantId,
            jobId: app.jobId,
            title: app.job.title,
            brief: app.job.responsibilities?.trim() || app.job.description,
            assignedById: admin.id,
          },
        });
        await notify(app.applicantId, "SYSTEM", "You've been placed!", {
          body: `Congratulations — you're placed as ${app.job.title}. Your first assignment is ready.`,
          link: "/assignments",
        });
        revalidatePath("/assignments");
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update application" };
  }
  revalidatePath("/admin/jobs");
  return { ok: true };
}
