"use client";

import { useState } from "react";
import { approveKycAction, rejectKycAction } from "@/server/actions/admin.actions";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function KycActions({ submissionId }: { submissionId: string }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const approve = async () => {
    setLoading(true);
    await approveKycAction(submissionId, note || undefined);
    router.refresh();
    setLoading(false);
  };

  const reject = async () => {
    if (!note) return;
    setLoading(true);
    await rejectKycAction(submissionId, note);
    router.refresh();
    setLoading(false);
    setRejectMode(false);
  };

  if (rejectMode) {
    return (
      <div className="flex gap-2 items-center">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Rejection reason..." className="flex-1" />
        <Button onClick={reject} variant="danger" loading={loading}>Reject</Button>
        <Button onClick={() => setRejectMode(false)} variant="ghost">Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="flex-1 text-sm" />
      <Button onClick={approve} loading={loading}>Approve</Button>
      <Button onClick={() => setRejectMode(true)} variant="danger">Reject</Button>
    </div>
  );
}
