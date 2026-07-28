"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitComboUnitAction } from "@/server/actions/assignment.actions";
import type { FieldDef } from "@/lib/fields";
import { FieldRenderer } from "@/components/tasks/FieldRenderer";
import { UnitInput } from "@/components/tasks/UnitInput";
import { Button, Card } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export type ComboUnit = {
  assignmentId: string;
  inputData: Record<string, unknown> | null;
};

export function ComboWorker({
  units,
  fields,
  instructions,
  rewardPerUnit,
}: {
  units: ComboUnit[];
  fields: FieldDef[];
  instructions: string;
  rewardPerUnit: number;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const total = units.length;
  const done = index >= total;

  if (done) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Combo complete 🎉</h2>
        <p className="mt-1 text-sm text-slate-600">
          You submitted {total} unit(s), worth up to{" "}
          {formatMoney(rewardPerUnit * total)} once approved.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => router.push("/submissions")}>View submissions</Button>
          <Button variant="secondary" onClick={() => router.push("/browse")}>
            Browse more
          </Button>
        </div>
      </Card>
    );
  }

  const unit = units[index];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) data[k] = v;

    setError(null);
    start(async () => {
      const res = await submitComboUnitAction(unit.assignmentId, data);
      if (res?.error) {
        setError(res.error);
      } else {
        form.reset();
        setIndex((i) => i + 1);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          Unit {index + 1} of {total}
        </p>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Instructions</h3>
          <p className="mb-4 whitespace-pre-wrap text-sm text-slate-600">{instructions}</p>
          <h3 className="mb-2 font-semibold">This unit</h3>
          <UnitInput data={unit.inputData} />
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Your submission</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <FieldRenderer key={`${unit.assignmentId}-${f.key}`} field={f} />
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending
                ? "Submitting…"
                : index + 1 === total
                  ? "Submit & finish"
                  : "Submit & next"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
