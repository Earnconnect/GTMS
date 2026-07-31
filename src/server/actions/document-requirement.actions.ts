"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";

export type ActionResult = { error?: string; ok?: boolean };

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

/**
 * Admin adds a new onboarding document requirement. It's added to every current
 * employee's checklist immediately and to new hires going forward.
 */
export async function addDocumentRequirementAction(input: {
  label: string;
  description?: string;
  required: boolean;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  const label = input.label.trim();
  if (!label) return { error: "Enter a document name." };

  const docType = slugify(label);
  if (!docType) return { error: "Enter a valid document name." };

  const clash = await db.documentRequirement.findUnique({ where: { docType } });
  if (clash) return { error: "A document requirement with a similar name already exists." };

  try {
    const count = await db.documentRequirement.count();
    await db.documentRequirement.create({
      data: {
        docType,
        label,
        description: input.description?.trim() || null,
        required: input.required,
        order: count,
      },
    });

    // Backfill onto every current employee's checklist.
    const employees = await db.user.findMany({
      where: { employmentStatus: { not: null } },
      select: { id: true },
    });
    if (employees.length) {
      await db.onboardingDocument.createMany({
        data: employees.map((e) => ({ userId: e.id, docType, label, required: input.required })),
        skipDuplicates: true,
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not add requirement" };
  }
  revalidatePath("/admin/onboarding");
  revalidatePath("/onboarding");
  return { ok: true };
}

/** Toggle whether a requirement is mandatory (also syncs existing checklist rows). */
export async function setRequirementRequiredAction(id: string, required: boolean): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    const req = await db.documentRequirement.update({ where: { id }, data: { required } });
    await db.onboardingDocument.updateMany({ where: { docType: req.docType }, data: { required } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update requirement" };
  }
  revalidatePath("/admin/onboarding");
  revalidatePath("/onboarding");
  return { ok: true };
}

/**
 * Activate/deactivate a requirement. Deactivating removes it from checklists
 * where it hasn't been submitted yet (submitted/verified copies are preserved).
 */
export async function setRequirementActiveAction(id: string, active: boolean): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    const req = await db.documentRequirement.update({ where: { id }, data: { active } });
    if (!active) {
      await db.onboardingDocument.deleteMany({
        where: { docType: req.docType, status: "NOT_SUBMITTED" },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update requirement" };
  }
  revalidatePath("/admin/onboarding");
  revalidatePath("/onboarding");
  return { ok: true };
}
