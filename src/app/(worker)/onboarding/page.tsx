import Link from "next/link";
import { CheckCircle2, Circle, FileText, GraduationCap, ArrowRight } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, SectionCard, StatCard, ButtonLink } from "@/components/ui";
import {
  ensureOnboardingDocuments,
  ensureRetirementPlan,
  getOnboardingProgress,
} from "@/server/services/onboarding.service";
import { DocumentRow, RetirementForm } from "@/components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const user = await requireRole("WORKER");

  const [profile] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { salaryCents: true } }),
    ensureOnboardingDocuments(user.id),
    ensureRetirementPlan(user.id),
  ]);

  const [progress, plan] = await Promise.all([
    getOnboardingProgress(user.id),
    db.retirementPlan.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        subtitle="Complete these steps to finish setting up your employment."
      />

      {/* Progress overview */}
      <SectionCard title="Your progress" description={`${progress.completed} of ${progress.total} steps complete`}>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {progress.steps.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-sm">
              {s.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={s.done ? "font-medium text-slate-800" : "text-slate-500"}>{s.label}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Documents */}
        <div className="lg:col-span-3">
          <SectionCard
            title="Document verification"
            description="Submit each document; our team reviews and verifies it."
          >
            <div className="divide-y divide-slate-100">
              {progress.docs.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Benefits + training */}
        <div className="space-y-6 lg:col-span-2">
          <StatCard
            label="Documents verified"
            value={`${progress.verifiedRequired}/${progress.requiredDocs}`}
            icon={<FileText className="h-5 w-5" />}
            tone="brand"
          />
          <SectionCard title="401(k) retirement plan" description="Set your contribution and employer match.">
            {plan && <RetirementForm plan={plan} salaryCents={profile?.salaryCents ?? 0} />}
          </SectionCard>

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-brand-600 to-emerald-600 p-5 text-white shadow-card">
            <GraduationCap className="h-6 w-6" />
            <h3 className="mt-3 text-base font-semibold">New-hire bootcamp</h3>
            <p className="mt-1 text-sm text-white/80">
              Enroll in onboarding training to get up to speed and unlock your first placements.
            </p>
            <Link
              href="/training"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-white/25"
            >
              Browse courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ButtonLink href="/jobs" variant="secondary" className="gap-2">
          Explore job placements <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}
