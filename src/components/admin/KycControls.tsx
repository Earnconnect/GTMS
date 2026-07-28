"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewKycAction } from "@/server/actions/kyc.actions";
import { Button, Input } from "@/components/ui";

export function KycControls({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(approve: boolean) {
    setError(null);
    start(async () => {
      const res = await reviewKycAction(userId, approve, reason || undefined);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button disabled={pending} onClick={() => run(true)}>
        Approve
      </Button>
      <Input
        placeholder="Reject reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-40"
      />
      <Button variant="danger" disabled={pending} onClick={() => run(false)}>
        Reject
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
