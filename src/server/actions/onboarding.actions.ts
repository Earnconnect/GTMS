"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireActiveUser, requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { ensureRetirementPlan } from "@/server/services/onboarding.service";
import { notify } from "@/server/services/notification.service";
import { isUploadEnabled } from "@/server/uploads";

export type ActionResult = { error?: string; ok?: boolean };

const MAX_DOC_BYTES = 8 * 1024 * 1024;
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

/** Employee uploads an actual document file (private Blob), e.g. their 401(k) form. */
export async function uploadDocumentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireActiveUser();
  if (!isUploadEnabled()) return { error: "File upload is not configured." };

  const documentId = String(formData.get("documentId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_DOC_BYTES) return { error: "File must be under 8 MB." };
  if (!DOC_TYPES.includes(file.type)) return { error: "Upload a PDF, Word document, or image." };

  const doc = await db.onboardingDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.userId !== user.id) return { error: "Document not found." };

  try {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60) || "document";
    const blob = await put(`documents/${user.id}/${doc.docType}/${safe}`, file, {
      access: "private",
      addRandomSuffix: true,
    });
    await db.onboardingDocument.update({
      where: { id: documentId },
      data: { status: "SUBMITTED", fileUrl: blob.url, fileName: file.name, note: null },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
  revalidatePath("/onboarding");
  revalidatePath("/admin/onboarding");
  return { ok: true };
}

/** Employee marks a document as submitted (records a filename label only). */
export async function submitDocumentAction(input: {
  documentId: string;
  fileName: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  const fileName = input.fileName.trim();
  if (!fileName) return { error: "Add a file name or reference." };
  try {
    const doc = await db.onboardingDocument.findUnique({ where: { id: input.documentId } });
    if (!doc || doc.userId !== user.id) return { error: "Document not found." };
    await db.onboardingDocument.update({
      where: { id: input.documentId },
      data: { status: "SUBMITTED", fileName, note: null },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit document" };
  }
  revalidatePath("/onboarding");
  return { ok: true };
}

/** Admin verifies or rejects a submitted document. */
export async function reviewDocumentAction(input: {
  documentId: string;
  approve: boolean;
  note?: string;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  try {
    const doc = await db.onboardingDocument.update({
      where: { id: input.documentId },
      data: {
        status: input.approve ? "VERIFIED" : "REJECTED",
        note: input.note?.trim() || null,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });
    await notify(
      doc.userId,
      "SYSTEM",
      input.approve ? "Document verified" : "Document needs attention",
      {
        body: `${doc.label} was ${input.approve ? "verified" : "rejected"}.`,
        link: "/onboarding",
      },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not review document" };
  }
  revalidatePath("/admin/onboarding");
  return { ok: true };
}

/** Employee enrolls in / updates their 401(k) benefit (simulated). */
export async function updateRetirementAction(input: {
  enrolled: boolean;
  contributionPct: number;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  const pct = Math.max(0, Math.min(50, Math.round(input.contributionPct)));
  try {
    await ensureRetirementPlan(user.id);
    await db.retirementPlan.update({
      where: { userId: user.id },
      data: { enrolled: input.enrolled, contributionPct: input.enrolled ? pct : 0 },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update plan" };
  }
  revalidatePath("/onboarding");
  return { ok: true };
}
