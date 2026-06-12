"use server";

import { requireWorker } from "@/server/rbac";
import { startExam, submitExam } from "@/server/services/certification.service";
import type { CertificationSlug } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type CertActionResult = { error?: string; success?: boolean; passed?: boolean; score?: number };

export async function startExamAction(slug: CertificationSlug): Promise<CertActionResult & { questions?: unknown[] }> {
  const user = await requireWorker();
  try {
    const result = await startExam(user.id, slug);
    return { success: true, questions: result.questions };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to start exam" };
  }
}

export async function submitExamAction(
  _prev: CertActionResult,
  formData: FormData
): Promise<CertActionResult> {
  const user = await requireWorker();
  const certificationId = formData.get("certificationId") as string;
  const answersRaw = formData.get("answers") as string;

  if (!certificationId || !answersRaw) return { error: "Missing exam data" };

  try {
    const answers: number[] = JSON.parse(answersRaw);
    const result = await submitExam({ workerId: user.id, certificationId, answers });
    revalidatePath("/dashboard/certifications");
    return { success: true, passed: result.passed, score: result.score };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to submit exam" };
  }
}
