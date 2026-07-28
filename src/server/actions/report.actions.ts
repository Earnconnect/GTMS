"use server";

import { revalidatePath } from "next/cache";
import type { ReportCategory, ReportStatus } from "@prisma/client";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";

export type ActionResult = { error?: string; ok?: boolean };

/** Employee submits a job report (progress, issue, incident, etc.). */
export async function submitReportAction(input: {
  category: ReportCategory;
  subject: string;
  body: string;
  priority: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  if (!input.subject.trim() || !input.body.trim()) return { error: "Subject and details are required." };
  try {
    await db.jobReport.create({
      data: {
        authorId: user.id,
        category: input.category,
        subject: input.subject.trim(),
        body: input.body.trim(),
        priority: ["low", "normal", "high", "urgent"].includes(input.priority) ? input.priority : "normal",
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit report" };
  }
  revalidatePath("/reports");
  revalidatePath("/admin/reports");
  return { ok: true };
}

/** Admin updates a report's status and (optionally) leaves a resolution note. */
export async function reviewReportAction(input: {
  reportId: string;
  status: ReportStatus;
  resolutionNote?: string;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  try {
    const report = await db.jobReport.update({
      where: { id: input.reportId },
      data: {
        status: input.status,
        resolutionNote: input.resolutionNote?.trim() || null,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });
    await notify(report.authorId, "SYSTEM", "Report update", {
      body: `Your report "${report.subject}" is now ${input.status.replace("_", " ").toLowerCase()}.`,
      link: "/reports",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update report" };
  }
  revalidatePath("/admin/reports");
  return { ok: true };
}
