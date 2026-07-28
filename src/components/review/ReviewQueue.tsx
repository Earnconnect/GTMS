"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
  bulkApproveAction,
} from "@/server/actions/submission.actions";
import type { FieldDef } from "@/lib/fields";
import { Button, Card, Input, EmptyState } from "@/components/ui";

export type QueueItem = {
  id: string;
  workerName: string;
  createdAt: string;
  data: Record<string, unknown>;
  inputData: Record<string, unknown> | null;
};

export function ReviewQueue({
  items,
  fields,
}: {
  items: QueueItem[];
  fields: FieldDef[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(fn: () => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  if (items.length === 0) {
    return <EmptyState>Nothing to review right now.</EmptyState>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} pending</p>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => act(() => bulkApproveAction(items.map((i) => i.id)))}
        >
          Approve all
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.map((item) => (
        <ReviewItem key={item.id} item={item} fields={fields} pending={pending} act={act} />
      ))}
    </div>
  );
}

function ReviewItem({
  item,
  fields,
  pending,
  act,
}: {
  item: QueueItem;
  fields: FieldDef[];
  pending: boolean;
  act: (fn: () => Promise<{ error?: string; ok?: boolean }>) => void;
}) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{item.workerName}</span>
        <span className="text-xs text-slate-400">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </div>

      {item.inputData && (
        <div className="mb-3 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          Input: {JSON.stringify(item.inputData)}
        </div>
      )}

      <dl className="mb-4 space-y-1 text-sm">
        {fields.map((f) => (
          <div key={f.key} className="flex gap-2">
            <dt className="font-medium text-slate-600">{f.label}:</dt>
            <dd className="text-slate-800">{String(item.data[f.key] ?? "—")}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={pending} onClick={() => act(() => approveSubmissionAction(item.id))}>
          Approve
        </Button>
        {!showReject ? (
          <Button variant="secondary" disabled={pending} onClick={() => setShowReject(true)}>
            Reject
          </Button>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="danger"
              disabled={pending || !reason.trim()}
              onClick={() => act(() => rejectSubmissionAction(item.id, reason))}
            >
              Confirm
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
