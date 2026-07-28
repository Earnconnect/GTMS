"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { payoutAction, type FormState } from "@/server/actions/wallet.actions";
import { Button, Input, Label } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export function PayoutForm({
  balance,
  minPayout,
}: {
  balance: number;
  minPayout: number;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(
    async (prev, fd) => {
      const res = await payoutAction(prev, fd);
      if (res?.ok) router.refresh();
      return res;
    },
    undefined,
  );

  const canPayout = balance >= minPayout;

  return (
    <form action={action} className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="amount">Withdraw earnings (USD)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min={(minPayout / 100).toFixed(2)}
            max={(balance / 100).toFixed(2)}
            defaultValue={(balance / 100).toFixed(2)}
            disabled={!canPayout}
          />
        </div>
        <Button type="submit" disabled={pending || !canPayout}>
          {pending ? "Requesting…" : "Request payout"}
        </Button>
      </div>
      {!canPayout && (
        <p className="text-sm text-slate-500">
          Minimum payout is {formatMoney(minPayout)}. Keep earning to withdraw.
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600">
          Payout requested — an admin will process it shortly.
        </p>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
