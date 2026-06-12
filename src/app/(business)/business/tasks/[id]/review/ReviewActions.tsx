"use client";

import { useState } from "react";
import { businessApproveSubmissionAction as approveSubmissionAction, businessRejectSubmissionAction as rejectSubmissionAction } from "@/server/actions/business.actions";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function ReviewActions({ submissionId }: { submissionId: string }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const approve = async () => {
    setLoading(true);
    await approveSubmissionAction(submissionId);
    router.refresh();
    setLoading(false);
  };

  const reject = async () => {
    if (!reason) return;
    setLoading(true);
    await rejectSubmissionAction(submissionId, reason);
    router.refresh();
    setLoading(false);
    setRejectMode(false);
  };

  if (rejectMode) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
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
      <Button onClick={approve} loading={loading}>Approve</Button>
      <Button onClick={() => setRejectMode(true)} variant="danger">Reject</Button>
    </div>
  );
}
