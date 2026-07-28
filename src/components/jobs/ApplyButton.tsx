"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToJobAction } from "@/server/actions/job.actions";
import { Button, Textarea } from "@/components/ui";

export function ApplyButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    setError(null);
    start(async () => {
      const res = await applyToJobAction({ jobId, coverNote: note });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Apply now
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a short note (optional)"
        disabled={pending}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={apply} disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
