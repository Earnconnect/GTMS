"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { assignJobAction, reviewAssignmentAction } from "@/server/actions/work.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

type Employee = { id: string; name: string | null; email: string; jobTitle: string | null; department: string | null };
type Job = { id: string; title: string };
type Template = {
  id: string;
  title: string;
  brief: string;
  role: string;
  department: string | null;
  estimatedHours: number;
  difficulty: string;
};

/** Does a catalog assignment suit this employee's role/department? */
function matchesRole(emp: Employee | undefined, tpl: Template): boolean {
  if (!emp) return true;
  if (tpl.role === "General") return true;
  const hay = `${emp.jobTitle ?? ""} ${emp.department ?? ""}`.toLowerCase();
  const roleWords = tpl.role.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (roleWords.some((w) => hay.includes(w))) return true;
  if (tpl.department && emp.department && tpl.department.toLowerCase() === emp.department.toLowerCase()) return true;
  return false;
}

export function AssignForm({
  employees,
  jobs,
  templates,
}: {
  employees: Employee[];
  jobs: Job[];
  templates: Template[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [jobId, setJobId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [showAll, setShowAll] = useState(false);

  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const catalog = useMemo(() => {
    const list = showAll ? templates : templates.filter((t) => matchesRole(selectedEmployee, t));
    return list;
  }, [templates, selectedEmployee, showAll]);

  if (employees.length === 0) {
    return <p className="text-sm text-slate-500">Onboard an employee first, then assign them work here.</p>;
  }

  function pickTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) {
      setTitle(t.title);
      setBrief(t.brief);
    }
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await assignJobAction({
        employeeId,
        jobId: jobId || undefined,
        title,
        brief,
        dueAt: dueAt || undefined,
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        setTemplateId("");
        setTitle("");
        setBrief("");
        setDueAt("");
        router.refresh();
      }
    });
  }

  if (!open) return <Button onClick={() => setOpen(true)}>+ Assign work</Button>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Select id="employeeId" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setTemplateId(""); }}>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name ? `${e.name} — ${e.jobTitle ?? "employee"}` : e.email}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="jobId">Related role (optional)</Label>
        <Select id="jobId" value={jobId} onChange={(e) => setJobId(e.target.value)}>
          <option value="">— None —</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </Select>
      </div>

      {/* Catalog picker */}
      <div className="sm:col-span-2 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0 flex items-center gap-1.5 text-brand-800">
            <Sparkles className="h-4 w-4" /> Pick from the assignment catalog
          </Label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all roles
          </label>
        </div>
        <Select value={templateId} onChange={(e) => pickTemplate(e.target.value)}>
          <option value="">
            {selectedEmployee ? `Suggested for ${selectedEmployee.jobTitle ?? "this role"}…` : "Choose an assignment…"}
          </option>
          {catalog.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} · {t.role} · {t.difficulty} · ~{t.estimatedHours}h
            </option>
          ))}
        </Select>
        {catalog.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">No catalog matches for this role — tick “Show all roles” or write a custom brief below.</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="title">Assignment title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Handle inbound support queue — week 1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="brief">Brief / instructions</Label>
        <Textarea id="brief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} required placeholder="What the employee needs to do, deliverables, and expectations…" />
      </div>
      <div>
        <Label htmlFor="dueAt">Due date (optional)</Label>
        <Input id="dueAt" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="button" onClick={submit} disabled={pending || !title.trim() || !brief.trim()}>
          {pending ? "Assigning…" : "Assign to employee"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
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
