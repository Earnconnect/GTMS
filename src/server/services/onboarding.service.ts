import { db } from "@/server/db";

/**
 * The standard onboarding document checklist. These are status-tracked only —
 * we record submission/verification state and a filename label, never real
 * sensitive numbers (no SSN, no bank/account numbers).
 */
export const DEFAULT_DOCUMENTS: { docType: string; label: string; required: boolean }[] = [
  { docType: "government_id", label: "Government-issued photo ID", required: true },
  { docType: "proof_of_address", label: "Proof of address", required: true },
  { docType: "tax_form", label: "Tax form (W-4 or local equivalent)", required: true },
  { docType: "signed_offer", label: "Signed offer letter", required: true },
  { docType: "direct_deposit", label: "Direct deposit authorization", required: false },
];

/** Idempotently create the document checklist rows for a user. */
export async function ensureOnboardingDocuments(userId: string) {
  const existing = await db.onboardingDocument.findMany({ where: { userId } });
  const have = new Set(existing.map((d) => d.docType));
  const missing = DEFAULT_DOCUMENTS.filter((d) => !have.has(d.docType));
  if (missing.length) {
    await db.onboardingDocument.createMany({
      data: missing.map((d) => ({ userId, docType: d.docType, label: d.label, required: d.required })),
    });
  }
  return db.onboardingDocument.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

/** Idempotently create a (not-enrolled) retirement plan for a user. */
export async function ensureRetirementPlan(userId: string) {
  const existing = await db.retirementPlan.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.retirementPlan.create({ data: { userId } });
}

/**
 * Compute onboarding progress across the four stages: documents verified,
 * a training enrollment, 401(k) decision made, and profile onboarded.
 */
export async function getOnboardingProgress(userId: string) {
  const [docs, enrollments, plan, user, method] = await Promise.all([
    db.onboardingDocument.findMany({ where: { userId } }),
    db.trainingEnrollment.count({ where: { userId } }),
    db.retirementPlan.findUnique({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, select: { employmentStatus: true, kycStatus: true } }),
    db.withdrawalMethod.findUnique({ where: { userId } }),
  ]);

  const requiredDocs = docs.filter((d) => d.required);
  const verifiedRequired = requiredDocs.filter((d) => d.status === "VERIFIED").length;
  const docsDone = requiredDocs.length > 0 && verifiedRequired === requiredDocs.length;

  const steps = [
    { key: "profile", label: "Employment activated", done: user?.employmentStatus === "EMPLOYED" },
    { key: "documents", label: "Documents verified", done: docsDone },
    { key: "verification", label: "Identity verified", done: user?.kycStatus === "APPROVED" },
    { key: "training", label: "Enrolled in training", done: enrollments > 0 },
    { key: "benefits", label: "401(k) decision made", done: Boolean(plan?.enrolled || (plan && plan.contributionPct === 0 && plan.updatedAt > plan.createdAt)) },
    { key: "payout", label: "Withdrawal details added", done: Boolean(method) },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return { steps, completed, total: steps.length, pct, docs, verifiedRequired, requiredDocs: requiredDocs.length, hasMethod: Boolean(method) };
}
