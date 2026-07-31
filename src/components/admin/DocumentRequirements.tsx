"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, RotateCcw } from "lucide-react";
import {
  addDocumentRequirementAction,
  setRequirementActiveAction,
  setRequirementRequiredAction,
} from "@/server/actions/document-requirement.actions";
import { Badge, Button, Input, Label } from "@/components/ui";

type Requirement = {
  id: string;
  docType: string;
  label: string;
  description: string | null;
  required: boolean;
  active: boolean;
};

export function DocumentRequirements({ requirements }: { requirements: Requirement[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function onAdd(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await addDocumentRequirementAction({
        label: String(formData.get("label") ?? ""),
        description: String(formData.get("description") ?? ""),
        required: formData.get("required") === "on",
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        (document.getElementById("req-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {open ? (
        <form id="req-form" action={onAdd} className="grid gap-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="label">Document name</Label>
            <Input id="label" name="label" required placeholder="Work authorization / visa" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Instructions (optional)</Label>
            <Input id="description" name="description" placeholder="e.g. valid visa or work permit" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input type="checkbox" name="required" defaultChecked /> Required for onboarding
          </label>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add requirement"}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setOpen(true)}>+ Add document requirement</Button>
      )}

      <ul className="divide-y divide-slate-100">
        {requirements.map((r) => (
          <li key={r.id} className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between ${r.active ? "" : "opacity-60"}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {r.label}
                  {!r.active && <span className="ml-2 text-xs text-slate-400">Inactive</span>}
                </p>
                {r.description && <p className="text-xs text-slate-400">{r.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pending || !r.active}
                onClick={() => run(() => setRequirementRequiredAction(r.id, !r.required))}
                className="disabled:cursor-not-allowed"
                title="Toggle required"
              >
                <Badge tone={r.required ? "yellow" : "gray"}>{r.required ? "Required" : "Optional"}</Badge>
              </button>
              {r.active ? (
                <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => setRequirementActiveAction(r.id, false))} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              ) : (
                <Button size="sm" disabled={pending} onClick={() => run(() => setRequirementActiveAction(r.id, true))} className="gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
