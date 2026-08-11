import { FileText, ShieldCheck } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, StatCard, Avatar, EmptyState } from "@/components/ui";
import { DocumentReview } from "@/components/admin/DocumentReview";
import { DocumentRequirements } from "@/components/admin/DocumentRequirements";
import { ensureDocumentRequirements } from "@/server/services/onboarding.service";

const DOC_TONE: Record<string, "gray" | "yellow" | "green" | "red"> = {
  NOT_SUBMITTED: "gray",
  SUBMITTED: "yellow",
  VERIFIED: "green",
  REJECTED: "red",
};

export default async function AdminOnboardingPage() {
  await requireRole("ADMIN");

  const requirements = await ensureDocumentRequirements();

  const [pending, verifiedCount, all] = await Promise.all([
    db.onboardingDocument.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { updatedAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    db.onboardingDocument.count({ where: { status: "VERIFIED" } }),
    db.onboardingDocument.findMany({
      orderBy: { updatedAt: "desc" },
      take: 60,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Document verification"
        subtitle="Review the identity, tax, and employment documents your new hires submit, approve or return them with a note, and keep every record securely on file."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={pending.length} icon={<FileText className="h-5 w-5" />} tone="amber" />
        <StatCard label="Verified" value={verifiedCount} icon={<ShieldCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Documents total" value={all.length} icon={<FileText className="h-5 w-5" />} tone="slate" />
      </div>

      <SectionCard
        title="Required documents"
        description="Add documents every employee must submit, or mark them optional. Changes apply to all employees."
      >
        <DocumentRequirements requirements={requirements} />
      </SectionCard>

      <SectionCard title="Awaiting review" description="Submitted documents that need verification.">
        {pending.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="h-5 w-5" />} title="All caught up">
            No documents are waiting for review.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.map((d) => (
              <li key={d.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={d.user.name} email={d.user.email} size={34} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.label}</p>
                    <p className="text-xs text-slate-400">
                      {d.user.name ?? d.user.email} ·{" "}
                      {d.fileUrl ? (
                        <a href={`/api/document/${d.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">
                          View file →
                        </a>
                      ) : (
                        d.fileName ?? "—"
                      )}
                    </p>
                  </div>
                </div>
                <DocumentReview documentId={d.id} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Recent activity" description="Latest document status changes.">
        <ul className="divide-y divide-slate-100">
          {all.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-700">
                  {d.label} — <span className="text-slate-400">{d.user.name ?? d.user.email}</span>
                </p>
              </div>
              <Badge tone={DOC_TONE[d.status]}>{d.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
