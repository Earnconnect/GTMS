import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, Badge, Button } from "@/components/ui";
import Link from "next/link";
import type { CertificationSlug } from "@/generated/prisma";
import {
  ArrowLeft,
  Award,
  Target,
  CalendarClock,
  ShieldCheck,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  BookOpen,
} from "lucide-react";

export default async function CertDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireWorker();
  const { slug } = await params;
  const { error } = await searchParams;

  const certSlug = slug.toUpperCase() as CertificationSlug;

  const cert = await db.certification.findUnique({ where: { slug: certSlug } });
  if (!cert) notFound();

  const workerCert = await db.workerCertification.findUnique({
    where: { workerId_certificationId: { workerId: user.id, certificationId: cert.id } },
  });

  const isPassed = workerCert?.status === "PASSED";
  const isExpired = workerCert?.status === "EXPIRED";
  const isFailed = workerCert?.status === "FAILED";
  const isInProgress = workerCert?.status === "IN_PROGRESS";
  const canTakeExam =
    !workerCert ||
    workerCert.status === "FAILED" ||
    workerCert.status === "EXPIRED" ||
    workerCert.status === "IN_PROGRESS";

  const statusBadge = isPassed && !isExpired ? (
    <span className="bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
      EARNED
    </span>
  ) : isExpired ? (
    <span className="bg-amber-50 text-amber-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
      EXPIRED
    </span>
  ) : isFailed ? (
    <span className="bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
      FAILED
    </span>
  ) : isInProgress ? (
    <span className="bg-amber-50 text-amber-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
      IN PROGRESS
    </span>
  ) : null;

  return (
    <div className="max-w-2xl">
      {/* Back Link */}
      <div className="pt-6 mb-4">
        <Link
          href="/dashboard/certifications"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certifications
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}>
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-800 leading-tight">{cert.title}</h1>
            <p className="mt-1 text-[13.5px] text-slate-500 max-w-sm">{cert.description}</p>
          </div>
        </div>
        {statusBadge && (
          <div className="ml-4 flex-shrink-0 mt-1">{statusBadge}</div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13.5px] text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Requirements Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">Requirements & Details</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Target className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11.5px] text-slate-400 font-medium">Passing Score</p>
                  <p className="text-[15px] font-bold text-slate-800">{cert.passingScore}%</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CalendarClock className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11.5px] text-slate-400 font-medium">Valid For</p>
                  <p className="text-[15px] font-bold text-slate-800">{cert.validityDays} days</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11.5px] text-slate-400 font-medium">Required Accuracy</p>
                  <p className="text-[15px] font-bold text-slate-800">{cert.requiredAccuracyScore}%</p>
                </div>
              </div>

              {workerCert?.score != null && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Your Best Score</p>
                    <p className={`text-[15px] font-bold ${isPassed ? "text-emerald-600" : "text-red-500"}`}>
                      {workerCert.score}%
                    </p>
                  </div>
                </div>
              )}

              {isPassed && workerCert?.earnedAt && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Earned</p>
                    <p className="text-[15px] font-bold text-slate-800">
                      {new Date(workerCert.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {(isPassed || isExpired) && workerCert?.expiresAt && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CalendarClock className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isExpired ? "text-red-400" : "text-slate-400"}`} />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Expires</p>
                    <p className={`text-[15px] font-bold ${isExpired ? "text-red-500" : "text-slate-800"}`}>
                      {new Date(workerCert.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What You'll Be Tested On */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">What you&apos;ll be tested on</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[13.5px] text-slate-600 leading-relaxed">{cert.description}</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="pt-1">
          {canTakeExam ? (
            <Link href={`/dashboard/certifications/${slug}/exam`} className="block">
              <button
                className="w-full h-11 rounded-xl text-white font-semibold text-[14px] shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
              >
                {isFailed ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retake Exam
                  </>
                ) : isExpired ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Recertify
                  </>
                ) : isInProgress ? (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Continue Exam
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Start Exam
                  </>
                )}
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-[13.5px] text-emerald-700 font-medium">
                Certification active until{" "}
                <span className="font-bold">
                  {workerCert?.expiresAt
                    ? new Date(workerCert.expiresAt).toLocaleDateString()
                    : "–"}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
