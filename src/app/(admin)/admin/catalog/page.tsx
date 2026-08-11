import { Library } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, StatCard, EmptyState } from "@/components/ui";
import { CreateTemplateForm, TemplateToggle } from "@/components/admin/TemplateManager";

const DIFF_TONE: Record<string, "green" | "yellow" | "red" | "gray"> = {
  Easy: "green",
  Medium: "yellow",
  Hard: "red",
};

export default async function AdminCatalogPage() {
  await requireRole("ADMIN");
  const templates = await db.assignmentTemplate.findMany({
    orderBy: [{ active: "desc" }, { role: "asc" }, { title: "asc" }],
  });
  const activeCount = templates.filter((t) => t.active).length;
  const roles = new Set(templates.map((t) => t.role)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Work management"
        title="Assignment catalog"
        subtitle="Curate a library of ready-made, role-matched assignments your team can draw from — so assigning meaningful work to any employee takes seconds, not drafting."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Templates" value={templates.length} icon={<Library className="h-5 w-5" />} tone="brand" />
        <StatCard label="Active" value={activeCount} icon={<Library className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Roles covered" value={roles} icon={<Library className="h-5 w-5" />} tone="slate" />
      </div>

      <SectionCard title="Add a template" description="New assignments appear in the role-matched picker when assigning work.">
        <CreateTemplateForm />
      </SectionCard>

      {templates.length === 0 ? (
        <EmptyState icon={<Library className="h-5 w-5" />} title="No templates yet">
          Add your first assignment template above.
        </EmptyState>
      ) : (
        <SectionCard title="Catalog">
          <ul className="space-y-3">
            {templates.map((t) => (
              <li key={t.id} className={`rounded-xl border p-4 ${t.active ? "border-slate-200" : "border-slate-200 bg-slate-50/60 opacity-70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                      <Badge tone="blue">{t.role}</Badge>
                      <Badge tone={DIFF_TONE[t.difficulty] ?? "gray"}>{t.difficulty}</Badge>
                      <span className="text-xs text-slate-400">~{t.estimatedHours}h{t.department ? ` · ${t.department}` : ""}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.brief}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!t.active && <Badge tone="gray">Inactive</Badge>}
                    <TemplateToggle id={t.id} active={t.active} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
