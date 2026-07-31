"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DocStatus } from "@prisma/client";
import { FileText, CheckCircle2, Clock, XCircle, Upload, PiggyBank, ExternalLink, Loader2 } from "lucide-react";
import { submitDocumentAction, uploadDocumentAction, updateRetirementAction } from "@/server/actions/onboarding.actions";
import { Badge, Button, Input } from "@/components/ui";
import { formatMoney } from "@/lib/money";

const DOC_TONE: Record<DocStatus, { tone: "gray" | "yellow" | "green" | "red"; icon: typeof Clock; label: string }> = {
  NOT_SUBMITTED: { tone: "gray", icon: Upload, label: "Not submitted" },
  SUBMITTED: { tone: "yellow", icon: Clock, label: "Under review" },
  VERIFIED: { tone: "green", icon: CheckCircle2, label: "Verified" },
  REJECTED: { tone: "red", icon: XCircle, label: "Rejected" },
};

export function DocumentRow({
  doc,
  uploadEnabled,
}: {
  doc: { id: string; label: string; required: boolean; status: DocStatus; fileName: string | null; fileUrl: string | null; note: string | null };
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = DOC_TONE[doc.status];
  const Icon = meta.icon;

  function submit() {
    setError(null);
    const name = fileName.trim() || `${doc.label}.pdf`;
    start(async () => {
      const res = await submitDocumentAction({ documentId: doc.id, fileName: name });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set("documentId", doc.id);
    fd.set("file", file);
    const res = await uploadDocumentAction(fd);
    setUploading(false);
    if (res.error) setError(res.error);
    else router.refresh();
    if (fileRef.current) fileRef.current.value = "";
  }

  const canSubmit = doc.status === "NOT_SUBMITTED" || doc.status === "REJECTED";

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <FileText className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-800">
            {doc.label}
            {!doc.required && <span className="ml-2 text-xs font-normal text-slate-400">Optional</span>}
          </p>
          {doc.fileName && (
            <p className="text-xs text-slate-400">
              {doc.fileUrl ? (
                <a href={`/api/document/${doc.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <ExternalLink className="h-3 w-3" /> {doc.fileName}
                </a>
              ) : (
                doc.fileName
              )}
            </p>
          )}
          {doc.status === "REJECTED" && doc.note && (
            <p className="text-xs text-red-500">Reviewer: {doc.note}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={meta.tone}>
          <Icon className="h-3 w-3" /> {meta.label}
        </Badge>
        {canSubmit && uploadEnabled && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf"
              onChange={onFileChange}
              disabled={uploading || pending}
              className="hidden"
            />
            <Button size="sm" disabled={uploading || pending} onClick={() => fileRef.current?.click()} className="gap-1">
              {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : <><Upload className="h-3.5 w-3.5" /> Upload</>}
            </Button>
          </>
        )}
        {canSubmit && !uploadEnabled && (
          <div className="flex items-center gap-2">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="file name"
              className="w-32 text-xs"
              disabled={pending}
            />
            <Button size="sm" onClick={submit} disabled={pending}>
              {pending ? "…" : "Submit"}
            </Button>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function RetirementForm({
  plan,
  salaryCents,
}: {
  plan: { enrolled: boolean; contributionPct: number; employerMatchPct: number; balanceCents: number; provider: string };
  salaryCents: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enrolled, setEnrolled] = useState(plan.enrolled);
  const [pct, setPct] = useState(plan.contributionPct || 5);
  const [error, setError] = useState<string | null>(null);

  const yourAnnual = Math.round(salaryCents * 12 * (pct / 100));
  const matchAnnual = Math.round(salaryCents * 12 * (Math.min(pct, plan.employerMatchPct) / 100));

  function save(nextEnrolled: boolean) {
    setError(null);
    start(async () => {
      const res = await updateRetirementAction({ enrolled: nextEnrolled, contributionPct: pct });
      if (res.error) setError(res.error);
      else {
        setEnrolled(nextEnrolled);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <PiggyBank className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{plan.provider}</p>
          <p className="text-xs text-slate-400">
            {enrolled ? `Enrolled · ${plan.contributionPct}% of salary` : "Not enrolled"}
            {" · "}Employer match up to {plan.employerMatchPct}%
          </p>
        </div>
        <span className="ml-auto text-right">
          <p className="text-xs text-slate-400">Balance</p>
          <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatMoney(plan.balanceCents)}</p>
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <label className="flex items-center justify-between text-sm font-medium text-slate-700">
          Your contribution
          <span className="text-brand-700">{pct}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          disabled={pending}
          className="mt-2 w-full accent-brand-600"
        />
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs text-slate-400">You / year (est.)</p>
            <p className="font-semibold text-slate-900 tabular-nums">{formatMoney(yourAnnual)}</p>
          </div>
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs text-slate-400">Employer match / year</p>
            <p className="font-semibold text-emerald-700 tabular-nums">{formatMoney(matchAnnual)}</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Projections are illustrative (simulated plan). No real accounts or funds are involved.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {enrolled ? (
          <>
            <Button size="sm" onClick={() => save(true)} disabled={pending}>
              Update contribution
            </Button>
            <Button size="sm" variant="secondary" onClick={() => save(false)} disabled={pending}>
              Opt out
            </Button>
          </>
        ) : (
          <Button size="sm" variant="success" onClick={() => save(true)} disabled={pending}>
            Enroll in 401(k)
          </Button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
