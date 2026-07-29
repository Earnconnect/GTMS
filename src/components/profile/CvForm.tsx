"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink, CheckCircle2, Pencil, Upload, Loader2 } from "lucide-react";
import { saveCvAction, uploadCvAction } from "@/server/actions/profile.actions";
import { Button, Input, Label, Textarea } from "@/components/ui";

export function CvForm({
  userId,
  cvUrl,
  cvFileName,
  cvSummary,
  submittedAt,
  uploadEnabled,
}: {
  userId: string;
  cvUrl: string | null;
  cvFileName: string | null;
  cvSummary: string | null;
  submittedAt: Date | null;
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!cvUrl && !cvSummary);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasFile = Boolean(cvUrl);
  const viewHref = `/api/cv/${userId}`;

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveCvAction({
        cvUrl: String(formData.get("cvUrl") ?? ""),
        cvSummary: String(formData.get("cvSummary") ?? ""),
      });
      if (res.error) setError(res.error);
      else { setEditing(false); router.refresh(); }
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadCvAction(fd);
    setUploading(false);
    if (res.error) setError(res.error);
    else { setEditing(false); router.refresh(); }
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {cvFileName ?? "CV submitted"}
            </p>
            <p className="text-xs text-slate-400">
              {submittedAt ? `Updated ${submittedAt.toLocaleDateString()}` : "On file"}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)} className="gap-1">
            <Pencil className="h-3.5 w-3.5" /> Update
          </Button>
        </div>
        {hasFile && (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> View CV
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
    <div className="space-y-5">
      {uploadEnabled && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-800">
            <Upload className="h-4 w-4" /> Upload your CV file
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf"
            onChange={onFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700 disabled:opacity-60"
          />
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            {uploading ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</>
            ) : (
              <>PDF, Word, or image · up to 5 MB · stored privately</>
            )}
          </p>
        </div>
      )}

      <form action={onSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-slate-400">{uploadEnabled ? "or add a link / summary" : "add a link or summary"}</span></div>
        </div>
        <div>
          <Label htmlFor="cvUrl">CV link</Label>
          <Input id="cvUrl" name="cvUrl" type="url" defaultValue={cvUrl && !hasFile ? cvUrl : ""} placeholder="https://drive.google.com/… or your LinkedIn URL" />
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <FileText className="h-3 w-3" /> A shareable link works too (Google Drive, Dropbox, LinkedIn…).
          </p>
        </div>
        <div>
          <Label htmlFor="cvSummary">Short summary (optional)</Label>
          <Textarea id="cvSummary" name="cvSummary" rows={3} defaultValue={cvSummary ?? ""} placeholder="Experience, skills, and highlights…" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending || uploading}>{pending ? "Saving…" : "Save"}</Button>
          {(cvUrl || cvSummary) && (
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          )}
        </div>
      </form>
      {error && !editing && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
