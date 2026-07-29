"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink, CheckCircle2, Pencil } from "lucide-react";
import { saveCvAction } from "@/server/actions/profile.actions";
import { Button, Input, Label, Textarea } from "@/components/ui";

export function CvForm({
  cvUrl,
  cvSummary,
  submittedAt,
}: {
  cvUrl: string | null;
  cvSummary: string | null;
  submittedAt: Date | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!cvUrl && !cvSummary);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveCvAction({
        cvUrl: String(formData.get("cvUrl") ?? ""),
        cvSummary: String(formData.get("cvSummary") ?? ""),
      });
      if (res.error) setError(res.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">CV submitted</p>
            <p className="text-xs text-slate-400">
              {submittedAt ? `Updated ${submittedAt.toLocaleDateString()}` : "On file"}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)} className="gap-1">
            <Pencil className="h-3.5 w-3.5" /> Update
          </Button>
        </div>
        {cvUrl && (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> View CV link
          </a>
        )}
        {cvSummary && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 line-clamp-4 whitespace-pre-line">
            {cvSummary}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cvUrl">CV link</Label>
        <Input
          id="cvUrl"
          name="cvUrl"
          type="url"
          defaultValue={cvUrl ?? ""}
          placeholder="https://drive.google.com/… or your LinkedIn URL"
        />
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <FileText className="h-3 w-3" /> Paste a shareable link to your résumé (Google Drive, Dropbox, LinkedIn…).
        </p>
      </div>
      <div>
        <Label htmlFor="cvSummary">Or paste a short summary</Label>
        <Textarea id="cvSummary" name="cvSummary" rows={4} defaultValue={cvSummary ?? ""} placeholder="Experience, skills, and highlights…" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Submit CV"}
        </Button>
        {(cvUrl || cvSummary) && (
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
