"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplateAction, setTemplateActiveAction } from "@/server/actions/template.actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

const ROLES = ["Customer Support", "Quality Assurance", "Operations", "Data", "Sales", "Content", "General"];

export function CreateTemplateForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createTemplateAction({
        title: String(formData.get("title") ?? ""),
        brief: String(formData.get("brief") ?? ""),
        role: String(formData.get("role") ?? "General"),
        department: String(formData.get("department") ?? ""),
        difficulty: String(formData.get("difficulty") ?? "Medium"),
        estimatedHours: Number(formData.get("estimatedHours") ?? 4),
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        (document.getElementById("template-form") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  if (!open) return <Button onClick={() => setOpen(true)}>+ New assignment template</Button>;

  return (
    <form id="template-form" action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Clear the inbound support queue" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="brief">Brief</Label>
        <Textarea id="brief" name="brief" rows={3} required placeholder="What the employee needs to do, deliverables, expectations…" />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="General">
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" placeholder="Operations" />
      </div>
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select id="difficulty" name="difficulty" defaultValue="Medium">
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="estimatedHours">Estimated hours</Label>
        <Input id="estimatedHours" name="estimatedHours" type="number" min="1" defaultValue={4} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add to catalog"}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}

export function TemplateToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant={active ? "secondary" : "primary"}
      disabled={pending}
      onClick={() => start(async () => { await setTemplateActiveAction(id, !active); router.refresh(); })}
    >
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}
