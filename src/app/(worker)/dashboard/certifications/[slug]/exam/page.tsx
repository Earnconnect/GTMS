import { requireWorker } from "@/server/rbac";
import { startExam } from "@/server/services/certification.service";
import { redirect } from "next/navigation";
import type { CertificationSlug } from "@/generated/prisma";
import ExamClient from "./ExamClient";
import { ArrowLeft, Award } from "lucide-react";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireWorker();
  const { slug } = await params;

  const certSlug = slug.toUpperCase() as CertificationSlug;

  let examData: Awaited<ReturnType<typeof startExam>>;
  try {
    examData = await startExam(user.id, certSlug);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cannot start exam";
    redirect(`/dashboard/certifications/${slug}?error=${encodeURIComponent(msg)}`);
  }

  const displayName = slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="max-w-2xl">
      {/* Back Link */}
      <div className="pt-6 mb-4">
        <a
          href={`/dashboard/certifications/${slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certification
        </a>
      </div>

      {/* Exam Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">
            {displayName} Exam
          </h1>
          <p className="mt-0.5 text-[13.5px] text-slate-500">
            {examData.questions.length} questions &middot; 30 minutes
          </p>
        </div>
      </div>

      <ExamClient
        certificationId={examData.certId}
        questions={
          examData.questions as Array<{ question: string; options: string[] }>
        }
        slug={slug}
      />
    </div>
  );
}
