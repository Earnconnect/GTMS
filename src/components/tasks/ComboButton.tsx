"use client";

import { useState, useTransition } from "react";
import { reserveBatchAction } from "@/server/actions/assignment.actions";
import { Button, Input } from "@/components/ui";

export function ComboButton({ taskId, max }: { taskId: string; max: number }) {
  const [count, setCount] = useState(Math.min(5, max));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="text-right">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={2}
          max={max}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-16"
          aria-label="Combo size"
        />
        <Button
          variant="secondary"
          disabled={pending || count < 2}
          onClick={() => {
            setError(null);
            start(async () => {
              // On success this redirects to the combo page.
              const res = await reserveBatchAction(taskId, count);
              if (res?.error) setError(res.error);
            });
          }}
        >
          {pending ? "Starting…" : "Start combo"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
