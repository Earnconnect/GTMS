"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReportCategory } from "@prisma/client";
import { submitReportAction } from "@/server/actions/report.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "PROGRESS", label: "Progress update" },
  { value: "ISSUE", label: "Issue / blocker" },
  { value: "INCIDENT", label: "Incident" },
  { value: "PAYROLL", label: "Payroll" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "OTHER", label: "Other" },
];

export function ReportForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await submitReportAction({
        category: String(formData.get("category")) as ReportCategory,
        subject: String(formData.get("subject") ?? ""),
        body: String(formData.get("body") ?? ""),
        priority: String(formData.get("priority") ?? "normal"),
      });
      if (res.error) setError(res.error);
      else {
        setOk(true);
        (document.getElementById("report-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form id="report-form" action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue="PROGRESS">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" name="priority" defaultValue="normal">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required placeholder="Short summary" />
      </div>
      <div>
        <Label htmlFor="body">Details</Label>
        <Textarea id="body" name="body" rows={4} required placeholder="Describe what happened, what you need, or your update…" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">Report submitted. Our team will review it.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
