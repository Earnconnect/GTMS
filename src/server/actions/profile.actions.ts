"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireActiveUser } from "@/server/rbac";
import { db } from "@/server/db";
import { isUploadEnabled } from "@/server/uploads";

export type ActionResult = { error?: string; ok?: boolean };

const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

/** Employee/candidate uploads a CV file to private Blob storage. */
export async function uploadCvAction(formData: FormData): Promise<ActionResult> {
  const user = await requireActiveUser();
  if (!isUploadEnabled()) return { error: "File upload is not configured." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_CV_BYTES) return { error: "File must be under 5 MB." };
  if (!CV_TYPES.includes(file.type)) return { error: "Upload a PDF, Word document, or image." };

  try {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60) || "cv";
    // Private store — the file is not publicly accessible; served via /api/cv.
    const blob = await put(`cvs/${user.id}/${safe}`, file, {
      access: "private",
      addRandomSuffix: true,
    });
    await db.user.update({
      where: { id: user.id },
      data: { cvUrl: blob.url, cvFileName: file.name, cvSubmittedAt: new Date() },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
  revalidatePath("/onboarding");
  revalidatePath("/jobs");
  return { ok: true };
}

function isValidUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Employee/candidate submits their CV: a link and/or a pasted summary. */
export async function saveCvAction(input: {
  cvUrl?: string;
  cvSummary?: string;
}): Promise<ActionResult> {
  const user = await requireActiveUser();
  const cvUrl = input.cvUrl?.trim() || "";
  const cvSummary = input.cvSummary?.trim() || "";

  if (!cvUrl && !cvSummary) return { error: "Add a CV link or paste a summary." };
  if (cvUrl && !isValidUrl(cvUrl)) return { error: "Enter a valid link starting with http(s)://" };

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        cvUrl: cvUrl || null,
        cvSummary: cvSummary || null,
        cvSubmittedAt: new Date(),
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save CV" };
  }
  revalidatePath("/onboarding");
  revalidatePath("/jobs");
  return { ok: true };
}
