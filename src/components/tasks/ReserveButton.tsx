"use client";

import { useState, useTransition } from "react";
import { reserveUnitAction } from "@/server/actions/assignment.actions";
import { Button } from "@/components/ui";

export function ReserveButton({ taskId }: { taskId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="text-right">
      <Button
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            // On success this redirects; on failure it returns an error.
            const res = await reserveUnitAction(taskId);
            if (res?.error) setError(res.error);
          });
        }}
      >
        {pending ? "Reserving…" : "Work on this"}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
