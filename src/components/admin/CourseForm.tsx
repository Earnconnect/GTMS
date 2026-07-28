"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TrainingLevel } from "@prisma/client";
import { createCourseAction } from "@/server/actions/training.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

export function CourseForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createCourseAction({
        title: String(formData.get("title") ?? ""),
        summary: String(formData.get("summary") ?? ""),
        category: String(formData.get("category") ?? "General"),
        level: String(formData.get("level") ?? "BEGINNER") as TrainingLevel,
        durationHours: Number(formData.get("durationHours") ?? 4),
        moduleCount: Number(formData.get("moduleCount") ?? 5),
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        (document.getElementById("course-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  if (!open) return <Button onClick={() => setOpen(true)}>+ New course</Button>;

  return (
    <form id="course-form" action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="title">Course title</Label>
        <Input id="title" name="title" required placeholder="Customer Support Fundamentals" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" rows={2} required />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" placeholder="Onboarding" />
      </div>
      <div>
        <Label htmlFor="level">Level</Label>
        <Select id="level" name="level" defaultValue="BEGINNER">
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="durationHours">Duration (hours)</Label>
        <Input id="durationHours" name="durationHours" type="number" min="1" defaultValue={4} />
      </div>
      <div>
        <Label htmlFor="moduleCount">Modules</Label>
        <Input id="moduleCount" name="moduleCount" type="number" min="1" defaultValue={5} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Publish course"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
