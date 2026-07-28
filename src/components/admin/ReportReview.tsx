"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReportStatus } from "@prisma/client";
import { reviewReportAction } from "@/server/actions/report.actions";
import { Button, Input } from "@/components/ui";

export function ReportReview({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(status: ReportStatus) {
    setError(null);
    start(async () => {
      const res = await reviewReportAction({ reportId, status, resolutionNote: note });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Response / resolution note"
        className="flex-1 text-xs"
        disabled={pending}
      />
      <div className="flex gap-1.5">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("UNDER_REVIEW")}>
          Reviewing
        </Button>
        <Button size="sm" variant="success" disabled={pending} onClick={() => act("RESOLVED")}>
          Resolve
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("DISMISSED")}>
          Dismiss
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
