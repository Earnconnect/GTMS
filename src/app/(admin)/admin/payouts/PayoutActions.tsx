"use client";

import { useState } from "react";
import { processPayoutAction, cancelPayoutAction } from "@/server/actions/admin.actions";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function PayoutActions({ payoutId }: { payoutId: string }) {
  const [cancelMode, setCancelMode] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const process = async () => {
    setLoading(true);
    await processPayoutAction(payoutId);
    router.refresh();
    setLoading(false);
  };

  const cancel = async () => {
    if (!reason) return;
    setLoading(true);
    await cancelPayoutAction(payoutId, reason);
    router.refresh();
    setLoading(false);
    setCancelMode(false);
  };

  if (cancelMode) {
    return (
      <div className="flex gap-2 items-center">
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Cancellation reason..." className="flex-1" />
        <Button onClick={cancel} variant="danger" loading={loading}>Confirm Cancel</Button>
        <Button onClick={() => setCancelMode(false)} variant="ghost">Back</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={process} loading={loading}>Mark Processed</Button>
      <Button onClick={() => setCancelMode(true)} variant="danger">Cancel</Button>
    </div>
  );
}
