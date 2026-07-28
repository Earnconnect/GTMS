import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Award, Wallet } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireRole("WORKER");

  const [course, enrollment] = await Promise.all([
    db.trainingCourse.findUnique({ where: { id: courseId } }),
    db.trainingEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId: user.id } },
    }),
  ]);
  if (!course) notFound();
  if (!enrollment || enrollment.status !== "COMPLETED") redirect(`/training/${courseId}`);

  const issued = enrollment.completedAt ?? new Date();
  const certId = `GTMS-${course.id.slice(0, 4).toUpperCase()}-${user.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="space-y-6">
      <Link href={`/training/${courseId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border-4 border-double border-brand-200 bg-white p-10 text-center shadow-soft">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #0d9488 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-md">
            <Award className="h-8 w-8" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-brand-700">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide">GTMS</span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Certificate of Completion
          </p>
          <p className="mt-6 text-sm text-slate-500">This certifies that</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {user.name ?? user.email}
          </h1>
          <p className="mt-4 text-sm text-slate-500">has successfully completed</p>
          <h2 className="mt-1 text-xl font-semibold text-brand-700">{course.title}</h2>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-between border-t border-slate-200 pt-4 text-left text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">{issued.toLocaleDateString()}</p>
              <p>Date issued</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">{certId}</p>
              <p>Certificate ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
