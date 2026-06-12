import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { CAREER_REQUIREMENTS } from "@/lib/career";
import { TIER_LIMITS } from "@/lib/membership";
import { canAccessTask } from "@/lib/permissions";
import ReserveButton from "./ReserveButton";
import type { FieldDef } from "@/lib/fields";
import {
  DollarSign,
  Layers,
  Users,
  ShieldCheck,
  Star,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  ClipboardList,
  Clock,
  TrendingUp,
} from "lucide-react";

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PRODUCT_INTELLIGENCE:    { label: "Product Intelligence",    color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  ORDER_OPERATIONS:        { label: "Order Operations",        color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD" },
  TRANSACTION_VERIFICATION:{ label: "Transaction Verification",color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  AI_DATA_INTELLIGENCE:    { label: "AI Data Intelligence",    color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
};

// Rough time estimates based on reward tier
function estimateTime(rewardCents: number, fieldCount: number): string {
  if (rewardCents >= 300) return "15–25 min";
  if (rewardCents >= 150) return "8–15 min";
  if (rewardCents >= 80)  return "5–10 min";
  return "2–5 min";
}

interface EligibilityItem {
  label: string;
  met: boolean;
  detail: string;
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const user = await requireWorker();
  const { taskId } = await params;

  const [task, worker] = await Promise.all([
    db.task.findUnique({
      where: { id: taskId },
      include: {
        requester: { select: { name: true } },
      },
    }),
    db.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        kycStatus: true,
        careerLevel: true,
        accuracyScore: true,
        membership: { select: { tier: true, status: true } },
        certifications: {
          where: { status: "PASSED" },
          include: { certification: { select: { slug: true } } },
        },
      },
    }),
  ]);

  if (!task) notFound();

  const effectiveTier = worker?.membership?.status === "ACTIVE"
    ? worker.membership.tier
    : "BASIC" as const;

  const access = canAccessTask(
    { ...worker!, membershipTier: effectiveTier },
    task
  );

  const availableCount = await db.assignment.count({
    where: { taskId, status: "AVAILABLE" },
  });

  const alreadyReserved = await db.assignment.findFirst({
    where: { taskId, workerId: user.id, status: "RESERVED" },
  });

  const fieldSchema = (task.fieldSchema as unknown as FieldDef[]) ?? [];

  const hasRequirements =
    task.requiredMembershipTier !== "BASIC" ||
    task.requiredCareerLevel !== "DIGITAL_ASSOCIATE" ||
    task.minAccuracyScore > 0 ||
    task.requiredCertifications.length > 0;

  // Build eligibility checklist
  const workerCertSlugs = (worker?.certifications ?? []).map(
    (c) => c.certification.slug
  );

  const eligibilityItems: EligibilityItem[] = [];

  // KYC
  eligibilityItems.push({
    label: "Identity Verified (KYC)",
    met: worker?.kycStatus === "APPROVED",
    detail:
      worker?.kycStatus === "APPROVED"
        ? "Your identity is verified"
        : "Submit KYC documents in your profile",
  });

  // Membership
  if (task.requiredMembershipTier && task.requiredMembershipTier !== "BASIC") {
    const tierLabel = TIER_LIMITS[task.requiredMembershipTier]?.label ?? task.requiredMembershipTier;
    const currentLabel = TIER_LIMITS[effectiveTier]?.label ?? effectiveTier;
    const tierMet =
      ["BASIC", "PROFESSIONAL", "EXECUTIVE"].indexOf(effectiveTier) >=
      ["BASIC", "PROFESSIONAL", "EXECUTIVE"].indexOf(task.requiredMembershipTier);
    eligibilityItems.push({
      label: `${tierLabel} Membership`,
      met: tierMet,
      detail: tierMet
        ? `You have ${currentLabel} membership`
        : `You have ${currentLabel} — upgrade to ${tierLabel} to access this task`,
    });
  }

  // Career level
  if (task.requiredCareerLevel && task.requiredCareerLevel !== "DIGITAL_ASSOCIATE") {
    const reqLabel = CAREER_REQUIREMENTS[task.requiredCareerLevel]?.label ?? task.requiredCareerLevel;
    const currentLabel = CAREER_REQUIREMENTS[worker?.careerLevel ?? "DIGITAL_ASSOCIATE"]?.label ?? "Digital Associate";
    const levelOrder = ["DIGITAL_ASSOCIATE", "CERTIFIED_REVIEWER", "SENIOR_VERIFIER", "VERIFICATION_SPECIALIST", "TEAM_SUPERVISOR"];
    const levelMet =
      levelOrder.indexOf(worker?.careerLevel ?? "DIGITAL_ASSOCIATE") >=
      levelOrder.indexOf(task.requiredCareerLevel);
    eligibilityItems.push({
      label: `Career Level: ${reqLabel}`,
      met: levelMet,
      detail: levelMet
        ? `Your level: ${currentLabel}`
        : `Your level: ${currentLabel} — complete more tasks to advance`,
    });
  }

  // Accuracy
  if (task.minAccuracyScore > 0) {
    const accuracyMet = (worker?.accuracyScore ?? 0) >= task.minAccuracyScore;
    eligibilityItems.push({
      label: `Min. Accuracy: ${task.minAccuracyScore}%`,
      met: accuracyMet,
      detail: accuracyMet
        ? `Your accuracy: ${(worker?.accuracyScore ?? 0).toFixed(1)}%`
        : `Your accuracy: ${(worker?.accuracyScore ?? 0).toFixed(1)}% — needs improvement`,
    });
  }

  // Certifications
  for (const slug of task.requiredCertifications) {
    const hasCert = workerCertSlugs.includes(slug as never);
    eligibilityItems.push({
      label: `Certification: ${slug.replace(/_/g, " ")}`,
      met: hasCert,
      detail: hasCert
        ? "Certification earned"
        : "Earn this certification from the Certifications page",
    });
  }

  const catStyle = CATEGORY_STYLES[task.category] ?? {
    label: task.category.replace(/_/g, " "),
    color: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
  };

  const estimatedTime = estimateTime(task.rewardPerUnitCents, fieldSchema.length);
  const completionPct = Math.round(
    ((task.totalUnits - availableCount) / Math.max(task.totalUnits, 1)) * 100
  );

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border"
            style={{ color: catStyle.color, background: catStyle.bg, borderColor: catStyle.border }}
          >
            {catStyle.label}
          </span>
          {task.qaEnabled && (
            <Badge variant="purple">QA Reviewed</Badge>
          )}
          <Badge variant={task.status === "ACTIVE" ? "success" : "warning"}>
            {task.status}
          </Badge>
        </div>
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight mt-2">
          {task.title}
        </h1>
        <p className="mt-1 text-[13.5px] text-slate-500">
          Posted by {task.requester.name ?? "Business"}
        </p>
      </div>

      {/* Reward + Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80 p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
              Reward per unit
            </p>
          </div>
          <p className="text-[28px] font-bold leading-none" style={{ color: "#F56565" }}>
            {formatMoney(task.rewardPerUnitCents)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[11.5px] text-slate-400">Est. {estimatedTime}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-slate-400" />
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
              Available
            </p>
          </div>
          <p className="text-[28px] font-bold text-slate-800 leading-none">{availableCount.toLocaleString()}</p>
          <p className="mt-1.5 text-[12px] text-slate-400">
            of {task.totalUnits.toLocaleString()} units
          </p>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="mt-1 text-[10.5px] text-slate-400">{completionPct}% claimed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-slate-400" />
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
              Limit
            </p>
          </div>
          <p className="text-[28px] font-bold text-slate-800 leading-none">
            {task.maxPerWorker ?? "∞"}
          </p>
          <p className="mt-1.5 text-[12px] text-slate-400">per worker</p>
        </div>
      </div>

      {/* Description + Instructions */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-[15px] font-semibold text-slate-800">Task Details</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-[12.5px] text-slate-400 font-medium mb-1.5">Description</p>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{task.description}</p>
            </div>
            {task.instructions && (
              <div className="pt-3 border-t border-slate-50">
                <p className="text-[12.5px] text-slate-400 font-medium mb-1.5">Instructions</p>
                <p className="text-[13.5px] text-slate-600 whitespace-pre-line leading-relaxed">
                  {task.instructions}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Checklist */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-[15px] font-semibold text-slate-800">Your Eligibility</h2>
            {access.allowed ? (
              <span className="ml-auto text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                Eligible
              </span>
            ) : (
              <span className="ml-auto text-[11.5px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                Requirements not met
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-50">
            {eligibilityItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                {item.met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13.5px] font-semibold ${
                      item.met ? "text-slate-700" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
            {eligibilityItems.length === 0 && (
              <div className="flex items-center gap-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-[13.5px] text-slate-700 font-semibold">
                  No special requirements — open to all workers
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Summary (only shown when task has explicit requirements) */}
      {hasRequirements && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">Requirements</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.requiredMembershipTier && task.requiredMembershipTier !== "BASIC" && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Membership</p>
                    <p className="text-[13.5px] text-slate-700 font-semibold">
                      {TIER_LIMITS[task.requiredMembershipTier]?.label ?? task.requiredMembershipTier}
                    </p>
                  </div>
                </div>
              )}
              {task.requiredCareerLevel && task.requiredCareerLevel !== "DIGITAL_ASSOCIATE" && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Award className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Career Level</p>
                    <p className="text-[13.5px] text-slate-700 font-semibold">
                      {CAREER_REQUIREMENTS[task.requiredCareerLevel].label}
                    </p>
                  </div>
                </div>
              )}
              {task.minAccuracyScore > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Min Accuracy</p>
                    <p className="text-[13.5px] text-slate-700 font-semibold">
                      {task.minAccuracyScore}%
                    </p>
                  </div>
                </div>
              )}
              {task.requiredCertifications.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-full md:col-span-1">
                  <ShieldCheck className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11.5px] text-slate-400 font-medium">Certifications</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {task.requiredCertifications.map((c) => (
                        <Badge key={c} variant="purple">{c.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fields Preview */}
      {fieldSchema.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">
                Fields you&apos;ll fill in
              </h2>
              <span className="ml-auto text-[11.5px] text-slate-400">
                {fieldSchema.length} field{fieldSchema.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-50">
              {fieldSchema.map((f, i) => (
                <div
                  key={f.name}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="text-[12px] font-semibold text-slate-400 w-5 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[13.5px] text-slate-700 flex-1">{f.label}</p>
                  <div className="flex items-center gap-1.5">
                    {f.required && (
                      <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                        required
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-medium">
                      {f.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      {!access.allowed ? (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13.5px] font-semibold text-amber-800">Access restricted</p>
            <p className="text-[13px] text-amber-700 mt-0.5">{access.reason}</p>
          </div>
        </div>
      ) : alreadyReserved ? (
        <a
          href={`/work/${alreadyReserved.id}`}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-white font-semibold text-[14px] shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          Continue Working
          <ArrowRight className="w-4 h-4" />
        </a>
      ) : availableCount === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 text-center">
          <p className="text-[13.5px] text-slate-500 font-medium">No units available right now.</p>
          <p className="text-[12.5px] text-slate-400 mt-0.5">Check back later for more slots.</p>
        </div>
      ) : (
        <div>
          <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="text-[13px] text-slate-500">
              Estimated time: <span className="font-semibold text-slate-700">{estimatedTime}</span>
              {" · "}
              Reservation holds for <span className="font-semibold text-slate-700">30 minutes</span>
            </p>
          </div>
          <ReserveButton taskId={taskId} />
        </div>
      )}
    </div>
  );
}
