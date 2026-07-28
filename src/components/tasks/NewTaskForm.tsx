"use client";

import { useActionState, useMemo, useState } from "react";
import { createTaskAction, type FormState } from "@/server/actions/task.actions";
import { FIELD_TYPES, type FieldDef, type FieldType } from "@/lib/fields";
import { TASK_CATEGORIES } from "@/lib/constants";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";

type DraftField = FieldDef & { _id: number };

let nextId = 1;
function blankField(): DraftField {
  return { _id: nextId++, key: "", label: "", type: "text", required: true };
}

function parseItems(raw: string): Array<Record<string, unknown>> {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        const obj = JSON.parse(line);
        return typeof obj === "object" && obj !== null ? obj : { text: line };
      } catch {
        // bare URL -> imageUrl, otherwise text
        return /^https?:\/\//.test(line) ? { imageUrl: line } : { text: line };
      }
    });
}

export function NewTaskForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createTaskAction,
    undefined,
  );

  const [fields, setFields] = useState<DraftField[]>([blankField()]);
  const [itemsRaw, setItemsRaw] = useState("");

  const items = useMemo(() => parseItems(itemsRaw), [itemsRaw]);

  function updateField(id: number, patch: Partial<DraftField>) {
    setFields((fs) => fs.map((f) => (f._id === id ? { ...f, ...patch } : f)));
  }

  const cleanFields: FieldDef[] = fields.map(({ _id, options, ...f }) => ({
    ...f,
    options:
      f.type === "select" || f.type === "radio"
        ? (options ?? []).filter(Boolean)
        : undefined,
  }));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="fields" value={JSON.stringify(cleanFields)} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Task details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Label product images" />
          </div>
          <div>
            <Label htmlFor="description">Short description</Label>
            <Input id="description" name="description" required />
          </div>
          <div>
            <Label htmlFor="instructions">Instructions for workers</Label>
            <Textarea id="instructions" name="instructions" required rows={4} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue="data-labeling">
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="reward">Reward per unit (USD)</Label>
              <Input id="reward" name="reward" type="number" step="0.01" min="0.01" required defaultValue="0.10" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="maxPerWorker">Max units per worker</Label>
              <Input id="maxPerWorker" name="maxPerWorker" type="number" min="1" defaultValue="5" />
            </div>
            <div>
              <Label htmlFor="reviewWindowH">Auto-approve after (hrs)</Label>
              <Input id="reviewWindowH" name="reviewWindowH" type="number" min="1" defaultValue="72" />
            </div>
            <div>
              <Label htmlFor="reservationTtlM">Reservation TTL (min)</Label>
              <Input id="reservationTtlM" name="reservationTtlM" type="number" min="5" defaultValue="30" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold">Output form</h2>
        <p className="mb-4 text-sm text-slate-500">
          What should each worker submit per unit? (Real deliverables only.)
        </p>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f._id} className="rounded-lg border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Field key</Label>
                  <Input
                    value={f.key}
                    onChange={(e) => updateField(f._id, { key: e.target.value })}
                    placeholder="label"
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input
                    value={f.label}
                    onChange={(e) => updateField(f._id, { label: e.target.value })}
                    placeholder="What is in this image?"
                  />
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={f.type}
                    onChange={(e) => updateField(f._id, { type: e.target.value as FieldType })}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                {(f.type === "select" || f.type === "radio") && (
                  <div className="sm:col-span-2">
                    <Label>Options (comma separated)</Label>
                    <Input
                      value={(f.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(f._id, {
                          options: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      placeholder="yes, no, unsure"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={f.required ?? false}
                    onChange={(e) => updateField(f._id, { required: e.target.checked })}
                  />
                  Required
                </label>
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFields((fs) => fs.filter((x) => x._id !== f._id))}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Remove field
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFields((fs) => [...fs, blankField()])}
          >
            + Add field
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold">Units</h2>
        <p className="mb-4 text-sm text-slate-500">
          One unit per line of input (a URL, text, or a JSON object). Leave empty
          for identical units (e.g. a survey) and set a count below.
        </p>
        <Textarea
          rows={6}
          value={itemsRaw}
          onChange={(e) => setItemsRaw(e.target.value)}
          placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
        />
        {items.length === 0 && (
          <div className="mt-3">
            <Label htmlFor="unitCount">Number of identical units</Label>
            <Input id="unitCount" name="unitCount" type="number" min="1" defaultValue="10" className="max-w-[160px]" />
          </div>
        )}
        <p className="mt-2 text-sm text-slate-600">
          {items.length > 0
            ? `${items.length} unit(s) from input lines.`
            : "Using identical units."}
        </p>
      </Card>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" name="publishNow" value="true" disabled={pending}>
          {pending ? "Saving…" : "Fund & publish"}
        </Button>
        <Button
          type="submit"
          name="publishNow"
          value="false"
          variant="secondary"
          disabled={pending}
        >
          Save as draft
        </Button>
      </div>
    </form>
  );
}
