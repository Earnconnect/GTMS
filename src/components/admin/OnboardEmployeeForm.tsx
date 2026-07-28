"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { onboardEmployeeAction } from "@/server/actions/admin.actions";
import { toCents } from "@/lib/money";
import { Button, Card, Input, Label, Select } from "@/components/ui";

type Candidate = { id: string; name: string | null; email: string };

export function OnboardEmployeeForm({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (candidates.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-500">
          No un-onboarded accounts. New hires register at{" "}
          <span className="font-medium">/register</span>, then appear here to onboard.
        </p>
      </Card>
    );
  }

  function onSubmit(formData: FormData) {
    setError(null);
    const userId = String(formData.get("userId") ?? "");
    const jobTitle = String(formData.get("jobTitle") ?? "");
    const department = String(formData.get("department") ?? "");
    const salaryCents = toCents(String(formData.get("salary") ?? "0"));
    start(async () => {
      const res = await onboardEmployeeAction({ userId, jobTitle, department, salaryCents });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Onboard a new employee</h2>
      <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="userId">Person</Label>
          <Select id="userId" name="userId" required>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ? `${c.name} — ${c.email}` : c.email}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" name="jobTitle" required placeholder="Customer Support Agent" />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" placeholder="Operations" />
        </div>
        <div>
          <Label htmlFor="salary">Salary per period ($)</Label>
          <Input id="salary" name="salary" type="number" min="0" step="0.01" placeholder="2000.00" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Onboarding…" : "Onboard employee"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      </form>
    </Card>
  );
}
