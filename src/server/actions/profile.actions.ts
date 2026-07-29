"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/server/rbac";
import { db } from "@/server/db";

export type ActionResult = { error?: string; ok?: boolean };

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
