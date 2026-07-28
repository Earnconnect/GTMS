"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  processPayoutAction,
  cancelPayoutAction,
} from "@/server/actions/admin.actions";
import { Button } from "@/components/ui";

export function PayoutControls({ payoutId }: { payoutId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button disabled={pending} onClick={() => run(() => processPayoutAction(payoutId))}>
        Pay out
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => run(() => cancelPayoutAction(payoutId))}
      >
        Cancel
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
