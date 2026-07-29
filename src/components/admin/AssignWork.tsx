"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignJobAction, reviewAssignmentAction } from "@/server/actions/work.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

type Employee = { id: string; name: string | null; email: string };
type Job = { id: string; title: string };

export function AssignForm({ employees, jobs }: { employees: Employee[]; jobs: Job[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (employees.length === 0) {
    return <p className="text-sm text-slate-500">Onboard an employee first, then assign them work here.</p>;
  }

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await assignJobAction({
        employeeId: String(formData.get("employeeId") ?? ""),
        jobId: String(formData.get("jobId") ?? "") || undefined,
        title: String(formData.get("title") ?? ""),
        brief: String(formData.get("brief") ?? ""),
        dueAt: String(formData.get("dueAt") ?? "") || undefined,
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        (document.getElementById("assign-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  if (!open) return <Button onClick={() => setOpen(true)}>+ Assign work</Button>;

  return (
    <form id="assign-form" action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Select id="employeeId" name="employeeId" required>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name ? `${e.name} — ${e.email}` : e.email}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="jobId">Related role (optional)</Label>
        <Select id="jobId" name="jobId" defaultValue="">
          <option value="">— None —</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="title">Assignment title</Label>
        <Input id="title" name="title" required placeholder="Handle inbound support queue — week 1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="brief">Brief / instructions</Label>
        <Textarea id="brief" name="brief" rows={3} required placeholder="What the employee needs to do, deliverables, and expectations…" />
      </div>
      <div>
        <Label htmlFor="dueAt">Due date (optional)</Label>
        <Input id="dueAt" name="dueAt" type="date" />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Assigning…" : "Assign to employee"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AssignmentReview({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(status: "COMPLETED" | "IN_PROGRESS") {
    setError(null);
    start(async () => {
      const res = await reviewAssignmentAction({ assignmentId, status, reviewNote: note });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Feedback (optional)"
        className="flex-1 text-xs"
        disabled={pending}
      />
      <div className="flex gap-1.5">
        <Button size="sm" variant="success" disabled={pending} onClick={() => act("COMPLETED")}>
          Approve
        </Button>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("IN_PROGRESS")}>
          Send back
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
