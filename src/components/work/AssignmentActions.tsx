"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Send } from "lucide-react";
import { startAssignmentAction, submitAssignmentAction } from "@/server/actions/work.actions";
import { Button, Textarea } from "@/components/ui";

export function StartButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      disabled={pending}
      className="gap-2"
      onClick={() =>
        start(async () => {
          await startAssignmentAction(assignmentId);
          router.refresh();
        })
      }
    >
      <Play className="h-4 w-4" /> {pending ? "Starting…" : "Start working"}
    </Button>
  );
}

export function SubmitWork({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      const res = await submitAssignmentAction({ assignmentId, note });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Summarize the work you completed, links to deliverables, and anything the reviewer should know…"
        disabled={pending}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={submit} disabled={pending} className="gap-2">
        <Send className="h-4 w-4" /> {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </div>
  );
}
