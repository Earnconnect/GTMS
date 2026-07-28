"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  postDisputeMessageAction,
  resolveDisputeAction,
} from "@/server/actions/dispute.actions";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";

export type DisputeView = {
  id: string;
  status: string;
  reason: string;
  taskTitle: string;
  resolutionNote?: string | null;
  messages: { id: string; authorName: string; body: string; createdAt: string }[];
};

export function DisputeThread({
  dispute,
  canResolve,
}: {
  dispute: DisputeView;
  canResolve: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const resolved = dispute.status.startsWith("RESOLVED");

  function act(fn: () => Promise<{ error?: string; ok?: boolean }>, clear?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        clear?.();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{dispute.taskTitle}</h3>
        <StatusBadge status={dispute.status} />
      </div>
      <p className="mb-3 text-sm text-slate-600">
        <span className="font-medium">Reason:</span> {dispute.reason}
      </p>

      <div className="mb-3 space-y-2">
        {dispute.messages.map((m) => (
          <div key={m.id} className="rounded-md bg-slate-50 p-2 text-sm">
            <span className="font-medium text-slate-700">{m.authorName}</span>{" "}
            <span className="text-xs text-slate-400">
              {new Date(m.createdAt).toLocaleString()}
            </span>
            <p className="text-slate-700">{m.body}</p>
          </div>
        ))}
        {dispute.messages.length === 0 && (
          <p className="text-sm text-slate-400">No messages yet.</p>
        )}
      </div>

      {dispute.resolutionNote && (
        <p className="mb-3 rounded-md bg-blue-50 p-2 text-sm text-blue-700">
          Resolution: {dispute.resolutionNote}
        </p>
      )}

      {!resolved && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            disabled={pending || !body.trim()}
            onClick={() =>
              act(() => postDisputeMessageAction(dispute.id, body), () => setBody(""))
            }
          >
            Send
          </Button>
        </div>
      )}

      {canResolve && !resolved && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Textarea
            placeholder="Resolution note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <div className="mt-2 flex gap-2">
            <Button
              disabled={pending}
              onClick={() => act(() => resolveDisputeAction(dispute.id, "WORKER", note))}
            >
              Rule for worker
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                act(() => resolveDisputeAction(dispute.id, "REQUESTER", note))
              }
            >
              Rule for requester
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
