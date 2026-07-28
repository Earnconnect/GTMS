"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { openDisputeAction } from "@/server/actions/dispute.actions";
import { Button, Input } from "@/components/ui";

export function OpenDisputeButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Dispute
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Why is this wrong?"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-56"
      />
      <Button
        disabled={pending || !reason.trim()}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await openDisputeAction(submissionId, reason);
            if (res.error) setError(res.error);
            else router.refresh();
          });
        }}
      >
        Submit
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
