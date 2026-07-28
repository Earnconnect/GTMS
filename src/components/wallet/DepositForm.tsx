"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { depositAction, type FormState } from "@/server/actions/wallet.actions";
import { Button, Input, Label } from "@/components/ui";

export function DepositForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(
    async (prev, fd) => {
      const res = await depositAction(prev, fd);
      if (res?.ok) router.refresh();
      return res;
    },
    undefined,
  );

  return (
    <form action={action} className="flex items-end gap-3">
      <div className="flex-1">
        <Label htmlFor="amount">Add funds (USD)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="1" defaultValue="50" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Processing…" : "Add funds"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
