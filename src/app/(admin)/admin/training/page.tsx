import { GraduationCap, Users } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, StatCard, EmptyState } from "@/components/ui";
import { CourseForm } from "@/components/admin/CourseForm";

const LEVEL_TONE: Record<string, "gray" | "blue" | "green" | "purple"> = {
  BEGINNER: "green",
  INTERMEDIATE: "blue",
  ADVANCED: "purple",
};

export default async function AdminTrainingPage() {
  await requireRole("ADMIN");
  const [courses, totalEnrollments, completions] = await Promise.all([
    db.trainingCourse.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    db.trainingEnrollment.count(),
    db.trainingEnrollment.count({ where: { status: "COMPLETED" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Bootcamp & training" subtitle="Publish courses and track completion across your team." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={courses.length} icon={<GraduationCap className="h-5 w-5" />} tone="brand" />
        <StatCard label="Enrollments" value={totalEnrollments} icon={<Users className="h-5 w-5" />} tone="slate" />
        <StatCard label="Completions" value={completions} icon={<GraduationCap className="h-5 w-5" />} tone="emerald" />
      </div>

      <SectionCard title="Create a course" description="Add a training course to the catalog.">
        <CourseForm />
      </SectionCard>

      {courses.length === 0 ? (
        <EmptyState icon={<GraduationCap className="h-5 w-5" />} title="No courses yet">
          Create your first course above.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3 text-right">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-800">{c.title}</div>
                    <div className="text-xs text-slate-400">{c.category}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={LEVEL_TONE[c.level]}>{c.level}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.durationHours}h · {c.moduleCount} modules
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-slate-700 tabular-nums">
                    {c._count.enrollments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
