"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus, JobStatus, JobType } from "@prisma/client";
import {
  createJobAction,
  decideApplicationAction,
  setJobStatusAction,
} from "@/server/actions/job.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { toCents } from "@/lib/money";

export function CreateJobForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createJobAction({
        title: String(formData.get("title") ?? ""),
        department: String(formData.get("department") ?? ""),
        location: String(formData.get("location") ?? ""),
        type: String(formData.get("type") ?? "FULL_TIME") as JobType,
        description: String(formData.get("description") ?? ""),
        responsibilities: String(formData.get("responsibilities") ?? ""),
        salaryMinCents: toCents(String(formData.get("salaryMin") ?? "0")),
        salaryMaxCents: toCents(String(formData.get("salaryMax") ?? "0")),
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        (document.getElementById("job-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Post a role</Button>;
  }

  return (
    <form id="job-form" action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="title">Job title</Label>
        <Input id="title" name="title" required placeholder="Senior Support Specialist" />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" required placeholder="Operations" />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Remote" />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select id="type" name="type" defaultValue="FULL_TIME">
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="REMOTE">Remote</option>
          <option value="INTERNSHIP">Internship</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="salaryMin">Salary min ($)</Label>
          <Input id="salaryMin" name="salaryMin" type="number" min="0" step="0.01" />
        </div>
        <div>
          <Label htmlFor="salaryMax">Salary max ($)</Label>
          <Input id="salaryMax" name="salaryMax" type="number" min="0" step="0.01" />
        </div>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="responsibilities">Responsibilities (optional)</Label>
        <Textarea id="responsibilities" name="responsibilities" rows={2} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting…" : "Publish role"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function JobStatusToggle({ jobId, status }: { jobId: string; status: JobStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = status === "OPEN" ? "CLOSED" : "OPEN";
  return (
    <Button
      size="sm"
      variant={status === "OPEN" ? "secondary" : "primary"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setJobStatusAction(jobId, next);
          router.refresh();
        })
      }
    >
      {status === "OPEN" ? "Close" : "Reopen"}
    </Button>
  );
}

const NEXT: { label: string; status: ApplicationStatus; variant: "primary" | "secondary" | "danger" | "success" }[] = [
  { label: "Review", status: "UNDER_REVIEW", variant: "secondary" },
  { label: "Interview", status: "INTERVIEW", variant: "secondary" },
  { label: "Place", status: "PLACED", variant: "success" },
  { label: "Reject", status: "REJECTED", variant: "danger" },
];

export function ApplicationDecision({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-1.5">
      {NEXT.map((n) => (
        <Button
          key={n.status}
          size="sm"
          variant={n.variant}
          disabled={pending}
          onClick={() =>
            start(async () => {
              await decideApplicationAction({ applicationId, status: n.status });
              router.refresh();
            })
          }
        >
          {n.label}
        </Button>
      ))}
    </div>
  );
}
