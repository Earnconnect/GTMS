"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmploymentStatus } from "@prisma/client";
import { paySalaryAction, setEmploymentStatusAction } from "@/server/actions/admin.actions";
import { toCents } from "@/lib/money";
import { Button, Input } from "@/components/ui";

export function EmployeeControls({
  employeeId,
  employmentStatus,
  defaultSalaryCents,
}: {
  employeeId: string;
  employmentStatus: EmploymentStatus | null;
  defaultSalaryCents: number | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [amount, setAmount] = useState(
    defaultSalaryCents ? (defaultSalaryCents / 100).toString() : "",
  );

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>, okMsg?: string) {
    setError(null);
    setOk(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        if (okMsg) setOk(okMsg);
        router.refresh();
      }
    });
  }

  function pay() {
    const cents = toCents(amount);
    if (cents <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    run(() => paySalaryAction({ employeeId, amountCents: cents }), "Paid");
  }

  const terminated = employmentStatus === "TERMINATED";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          disabled={pending || terminated}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-24 text-right"
        />
        <Button disabled={pending || terminated} onClick={pay}>
          Pay
        </Button>
        {employmentStatus === "EMPLOYED" ? (
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => run(() => setEmploymentStatusAction(employeeId, "SUSPENDED"))}
          >
            Suspend
          </Button>
        ) : employmentStatus === "SUSPENDED" ? (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => setEmploymentStatusAction(employeeId, "EMPLOYED"))}
          >
            Reactivate
          </Button>
        ) : null}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {ok && <span className="text-xs text-green-600">{ok}</span>}
    </div>
  );
}
