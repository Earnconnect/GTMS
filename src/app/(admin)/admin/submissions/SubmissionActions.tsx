"use client";

import { useState } from "react";
import { adminApproveSubmissionAction, adminRejectSubmissionAction } from "@/server/actions/admin.actions";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function SubmissionActions({ submissionId }: { submissionId: string }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const approve = async () => {
    setLoading(true);
    setError(null);
    const result = await adminApproveSubmissionAction(submissionId);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  const reject = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    setError(null);
    const result = await adminRejectSubmissionAction(submissionId, reason);
    if (result.error) setError(result.error);
    else {
      router.refresh();
      setRejectMode(false);
    }
    setLoading(false);
  };

  if (rejectMode) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 items-center">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason..."
            className="flex-1 text-xs"
          />
          <Button
            onClick={reject}
            variant="danger"
            size="sm"
            loading={loading}
            disabled={!reason.trim()}
          >
            Confirm
          </Button>
          <Button onClick={() => setRejectMode(false)} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button
          onClick={approve}
          size="sm"
          loading={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Approve
        </Button>
        <Button
          onClick={() => setRejectMode(true)}
          size="sm"
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          Reject
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
