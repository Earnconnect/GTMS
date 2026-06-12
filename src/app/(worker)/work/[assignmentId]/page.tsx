import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import WorkForm from "./WorkForm";
import type { FieldDef } from "@/lib/fields";
import {
  CheckCircle2,
  ClipboardList,
  Database,
  ArrowRight,
  DollarSign,
  BookOpen,
  PenLine,
  Send,
} from "lucide-react";

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PRODUCT_INTELLIGENCE:    { label: "Product Intelligence",    color: "#7C3AED", bg: "#F5F3FF" },
  ORDER_OPERATIONS:        { label: "Order Operations",        color: "#0369A1", bg: "#F0F9FF" },
  TRANSACTION_VERIFICATION:{ label: "Transaction Verification",color: "#065F46", bg: "#ECFDF5" },
  AI_DATA_INTELLIGENCE:    { label: "AI Data Intelligence",    color: "#C2410C", bg: "#FFF7ED" },
};

function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, icon: BookOpen,   label: "Read Instructions" },
    { n: 2, icon: PenLine,    label: "Complete Work"     },
    { n: 3, icon: Send,       label: "Submit"            },
  ] as const;

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map(({ n, icon: Icon, label }, idx) => {
        const done = n < currentStep;
        const active = n === currentStep;
        return (
          <div key={n} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-cyan-500 border-cyan-500 text-white"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold text-center leading-tight ${
                  active ? "text-cyan-600" : done ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-full mx-1 flex-shrink-0 rounded-full transition-colors ${
                  n < currentStep ? "bg-emerald-400" : "bg-slate-100"
                }`}
                style={{ maxWidth: 60 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const user = await requireWorker();
  const { assignmentId } = await params;

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId, workerId: user.id },
    include: {
      task: true,
      submission: { select: { id: true, status: true } },
    },
  });

  if (!assignment) notFound();

  if (assignment.status === "SUBMITTED" || assignment.submission) {
    const subStatus = assignment.submission?.status ?? "PENDING";
    const statusVariant =
      subStatus === "APPROVED"
        ? "success"
        : subStatus === "REJECTED"
        ? "danger"
        : "warning";

    return (
      <div className="max-w-xl">
        <div className="pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Work Submitted</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">Your submission is under review</p>
        </div>
        <StepIndicator currentStep={3} />
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-[17px] font-bold text-slate-800 mb-1">Submission received</h2>
            <p className="text-[13.5px] text-slate-500 mb-4">
              Your work for{" "}
              <span className="font-semibold text-slate-700">{assignment.task.title}</span>{" "}
              has been submitted successfully.
            </p>
            <Badge variant={statusVariant}>{subStatus}</Badge>
            <div className="mt-6">
              <a
                href="/dashboard/submissions"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-white font-semibold text-[13.5px] shadow-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
              >
                View Submissions
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assignment.status !== "RESERVED") notFound();

  const fieldSchema = (assignment.task.fieldSchema as unknown as FieldDef[]) ?? [];
  const inputData = assignment.inputData as Record<string, unknown> | null;
  const expiresAt = assignment.expiresAt?.toISOString() ?? null;

  const catStyle = CATEGORY_STYLES[assignment.task.category] ?? {
    label: assignment.task.category.replace(/_/g, " "),
    color: "#64748B",
    bg: "#F8FAFC",
  };

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-semibold"
            style={{ color: catStyle.color, background: catStyle.bg }}
          >
            {catStyle.label}
          </span>
          <Badge variant="warning">In Progress</Badge>
        </div>
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">
          {assignment.task.title}
        </h1>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "#F56565" }}>
          <DollarSign className="w-4 h-4" />
          {formatMoney(assignment.task.rewardPerUnitCents)} reward upon approval
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={2} />

      {/* Instructions */}
      {assignment.task.instructions && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">Instructions</h2>
              <span className="ml-auto text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                Step 1 — read before starting
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[13.5px] text-slate-600 whitespace-pre-line leading-relaxed">
              {assignment.task.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Input Data */}
      {inputData && Object.keys(inputData).length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <h2 className="text-[15px] font-semibold text-slate-800">Input Data</h2>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-slate-50">
              {Object.entries(inputData).map(([k, v]) => (
                <div key={k} className="flex items-start gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-[11.5px] text-slate-400 uppercase tracking-wider font-semibold w-28 flex-shrink-0 pt-0.5">
                    {k}
                  </dt>
                  <dd className="text-[13.5px] text-slate-700 font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Work Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-slate-400" />
            <h2 className="text-[15px] font-semibold text-slate-800">Your Submission</h2>
            <span className="ml-auto text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
              Step 2 — complete all fields
            </span>
          </div>
          <p className="text-[12.5px] text-slate-400 mt-0.5">
            Fill in all required fields accurately. Your accuracy score affects future task eligibility.
          </p>
        </CardHeader>
        <CardContent>
          <WorkForm
            assignmentId={assignmentId}
            fieldSchema={fieldSchema}
            expiresAt={expiresAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
