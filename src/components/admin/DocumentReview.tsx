"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewDocumentAction } from "@/server/actions/onboarding.actions";
import { Button, Input } from "@/components/ui";

export function DocumentReview({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(approve: boolean) {
    setError(null);
    start(async () => {
      const res = await reviewDocumentAction({ documentId, approve, note });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (if rejecting)"
        className="w-40 text-xs"
        disabled={pending}
      />
      <Button size="sm" variant="success" disabled={pending} onClick={() => act(true)}>
        Verify
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => act(false)}>
        Reject
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
