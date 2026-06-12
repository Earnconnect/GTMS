"use client";

import { useState } from "react";
import { approveDepositAction, rejectDepositAction } from "@/server/actions/admin.actions";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function DepositActions({ depositId }: { depositId: string }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const approve = async () => {
    setLoading(true);
    await approveDepositAction(depositId, note || undefined);
    router.refresh();
    setLoading(false);
  };

  const reject = async () => {
    if (!note) return;
    setLoading(true);
    await rejectDepositAction(depositId, note);
    router.refresh();
    setLoading(false);
    setRejectMode(false);
  };

  if (rejectMode) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Rejection reason..."
          className="flex-1"
        />
        <Button onClick={reject} variant="danger" loading={loading}>Reject</Button>
        <Button onClick={() => setRejectMode(false)} variant="ghost">Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin note (optional)"
        className="flex-1 text-sm"
      />
      <Button onClick={approve} loading={loading}>Approve</Button>
      <Button onClick={() => setRejectMode(true)} variant="danger">Reject</Button>
    </div>
  );
}
