import { db } from "@/server/db";
import type { CertificationSlug } from "@/generated/prisma";
import { notify } from "@/server/services/notification.service";

interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export async function getCertificationCatalog() {
  return db.certification.findMany({ orderBy: { slug: "asc" } });
}

export async function getWorkerCertifications(workerId: string) {
  return db.workerCertification.findMany({
    where: { workerId },
    include: { certification: true },
  });
}

export async function startExam(workerId: string, slug: CertificationSlug) {
  const cert = await db.certification.findUnique({ where: { slug } });
  if (!cert) throw new Error("Certification not found");

  const worker = await db.user.findUnique({
    where: { id: workerId },
    select: { accuracyScore: true },
  });
  if (!worker) throw new Error("Worker not found");
  if (worker.accuracyScore < cert.requiredAccuracyScore) {
    throw new Error(`Requires ${cert.requiredAccuracyScore}% accuracy score`);
  }

  await db.workerCertification.upsert({
    where: { workerId_certificationId: { workerId, certificationId: cert.id } },
    create: { workerId, certificationId: cert.id, status: "IN_PROGRESS" },
    update: { status: "IN_PROGRESS" },
  });

  return { certId: cert.id, questions: cert.examQuestions as unknown as ExamQuestion[] };
}

export async function submitExam(params: {
  workerId: string;
  certificationId: string;
  answers: number[];
}) {
  const { workerId, certificationId, answers } = params;

  const cert = await db.certification.findUnique({ where: { id: certificationId } });
  if (!cert) throw new Error("Certification not found");

  const questions = cert.examQuestions as unknown as ExamQuestion[];
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) correct++;
  }

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= cert.passingScore;

  const expiresAt = passed
    ? new Date(Date.now() + cert.validityDays * 24 * 3600 * 1000)
    : undefined;

  await db.workerCertification.update({
    where: { workerId_certificationId: { workerId, certificationId } },
    data: {
      status: passed ? "PASSED" : "FAILED",
      score,
      earnedAt: passed ? new Date() : undefined,
      expiresAt,
    },
  });

  if (passed) {
    await notify({
      userId: workerId,
      type: "CERTIFICATION_EARNED",
      title: "Certification Earned!",
      body: `You've earned the ${cert.title} certification.`,
      link: "/dashboard/certifications",
    });
  }

  return { passed, score };
}
