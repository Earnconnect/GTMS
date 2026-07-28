"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  publishTaskAction,
  pauseTaskAction,
  cancelTaskAction,
} from "@/server/actions/task.actions";
import { Button } from "@/components/ui";

export function TaskControls({
  taskId,
  status,
}: {
  taskId: string;
  status: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(fn: () => Promise<{ error?: string } | void>) {
    setError(null);
    start(async () => {
      try {
        const res = await fn();
        if (res && "error" in res && res.error) setError(res.error);
        else router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <Button disabled={pending} onClick={() => run(() => publishTaskAction(taskId))}>
            Fund & publish
          </Button>
        )}
        {status === "ACTIVE" && (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => pauseTaskAction(taskId, true))}
          >
            Pause
          </Button>
        )}
        {status === "PAUSED" && (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => pauseTaskAction(taskId, false))}
          >
            Resume
          </Button>
        )}
        {["DRAFT", "ACTIVE", "PAUSED"].includes(status) && (
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (confirm("Cancel this task and refund unused escrow?"))
                run(() => cancelTaskAction(taskId));
            }}
          >
            Cancel
          </Button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
