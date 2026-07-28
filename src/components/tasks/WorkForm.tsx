"use client";

import { useActionState } from "react";
import {
  submitWorkAction,
  type FormState,
} from "@/server/actions/assignment.actions";
import type { FieldDef } from "@/lib/fields";
import { FieldRenderer } from "@/components/tasks/FieldRenderer";
import { Button } from "@/components/ui";

export function WorkForm({
  assignmentId,
  fields,
}: {
  assignmentId: string;
  fields: FieldDef[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitWorkAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {fields.map((f) => (
        <FieldRenderer key={f.key} field={f} />
      ))}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit deliverable"}
      </Button>
    </form>
  );
}
