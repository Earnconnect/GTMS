import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, Clock, Layers, Award } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, SectionCard } from "@/components/ui";
import { ModuleList } from "@/components/training/ModuleList";

const LEVEL_TONE: Record<string, "gray" | "blue" | "green" | "purple"> = {
  BEGINNER: "green",
  INTERMEDIATE: "blue",
  ADVANCED: "purple",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireRole("WORKER");

  const course = await db.trainingCourse.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  const enrollment = await db.trainingEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
    include: { completions: true },
  });
  const completedIds = enrollment?.completions.map((c) => c.moduleId) ?? [];
  const pct = course.modules.length
    ? Math.round((completedIds.length / course.modules.length) * 100)
    : 0;
  const completed = course.modules.length > 0 && completedIds.length >= course.modules.length;

  return (
    <div className="space-y-6">
      <Link href="/training" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-brand-600 to-emerald-600 p-6 text-white shadow-card">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </span>
          <Badge tone={LEVEL_TONE[course.level]}>{course.level}</Badge>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">{course.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {course.durationHours}h</span>
          <span className="inline-flex items-center gap-1"><Layers className="h-4 w-4" /> {course.modules.length} modules</span>
          <span>{course.category}</span>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-white/70">{pct}% complete</p>
        </div>
      </div>

      {completed && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Award className="h-5 w-5 shrink-0" />
          You&apos;ve completed this course.
          <Link href={`/training/${course.id}/certificate`} className="ml-auto font-semibold underline">
            View certificate
          </Link>
        </div>
      )}

      <SectionCard title="Course modules" description="Work through each module in order.">
        {course.modules.length === 0 ? (
          <p className="text-sm text-slate-400">Modules are being prepared for this course.</p>
        ) : (
          <ModuleList courseId={course.id} modules={course.modules} completedIds={completedIds} />
        )}
      </SectionCard>
    </div>
  );
}
