import { GraduationCap, Clock, Layers, BookOpen } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, StatCard, SectionCard, EmptyState } from "@/components/ui";
import { EnrollButton, ProgressControl } from "@/components/training/CourseActions";

const LEVEL_TONE: Record<string, "gray" | "blue" | "green" | "purple"> = {
  BEGINNER: "green",
  INTERMEDIATE: "blue",
  ADVANCED: "purple",
};

export default async function TrainingPage() {
  const user = await requireRole("WORKER");

  const [courses, enrollments] = await Promise.all([
    db.trainingCourse.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
    db.trainingEnrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const enrolledMap = new Map(enrollments.map((e) => [e.courseId, e]));
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const inProgress = enrollments.filter((e) => e.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bootcamp & training"
        subtitle="Build the skills for your role. Complete courses to strengthen your profile."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled" value={enrollments.length} icon={<BookOpen className="h-5 w-5" />} tone="brand" />
        <StatCard label="In progress" value={inProgress} icon={<Clock className="h-5 w-5" />} tone="amber" />
        <StatCard label="Completed" value={completed} icon={<GraduationCap className="h-5 w-5" />} tone="emerald" />
      </div>

      {enrollments.length > 0 && (
        <SectionCard title="Continue learning" description="Pick up where you left off.">
          <ul className="space-y-4">
            {enrollments.map((e) => (
              <li key={e.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{e.course.title}</p>
                    <p className="text-xs text-slate-400">
                      {e.progressPct}% · {e.course.moduleCount} modules
                    </p>
                  </div>
                  <ProgressControl
                    enrollmentId={e.id}
                    progressPct={e.progressPct}
                    moduleCount={e.course.moduleCount}
                  />
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all"
                    style={{ width: `${e.progressPct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Course catalog</h2>
        {courses.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No courses yet">
            Training courses will appear here once published.
          </EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {courses.map((c) => {
              const enrolled = enrolledMap.get(c.id);
              return (
                <div
                  key={c.id}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <Badge tone={LEVEL_TONE[c.level]}>{c.level}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{c.summary}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {c.durationHours}h
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> {c.moduleCount} modules
                      </span>
                    </div>
                    {enrolled ? (
                      <Badge tone="green">Enrolled</Badge>
                    ) : (
                      <EnrollButton courseId={c.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
