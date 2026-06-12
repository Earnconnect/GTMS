"use client";

import { useActionState, useState, useEffect } from "react";
import { createTaskAction } from "@/server/actions/task.actions";
import {
  Button, Input, Textarea, Select, FormField, Alert, Card, CardHeader, CardContent, PageHeader,
} from "@/components/ui";
import type { FieldDef, FieldType } from "@/lib/fields";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText, Settings, LayoutList, ChevronRight } from "lucide-react";

const CATEGORIES = [
  "PRODUCT_INTELLIGENCE",
  "ORDER_OPERATIONS",
  "TRANSACTION_VERIFICATION",
  "AI_DATA_INTELLIGENCE",
];

const FIELD_TYPES: FieldType[] = ["text", "textarea", "number", "select", "boolean", "url", "date"];

export default function NewTaskPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createTaskAction, {});
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Partial<FieldDef>>({ type: "text" });

  useEffect(() => {
    if (state.success && state.taskId) {
      router.push(`/business/tasks/${state.taskId}`);
    }
  }, [state.success, state.taskId, router]);

  const addField = () => {
    if (!newField.name || !newField.label) return;
    setFields((prev) => [...prev, newField as FieldDef]);
    setNewField({ type: "text" });
    setShowAddField(false);
  };

  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="pt-6 pb-4 mb-6">
        <div className="flex items-center gap-2 text-[12.5px] text-slate-400 mb-3">
          <a href="/business/tasks" className="hover:text-slate-600 transition-colors">Tasks</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600">New Task</span>
        </div>
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Post New Task</h1>
        <p className="mt-1 text-[13.5px] text-slate-600">
          Fill in the details below to create a new workforce task
        </p>
      </div>

      {state.error && (
        <Alert variant="danger" className="mb-5">
          {state.error}
        </Alert>
      )}

      <form action={action} className="space-y-5">
        <input type="hidden" name="fieldSchema" value={JSON.stringify(fields)} />

        {/* Section 1: Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-800">Basic Information</h2>
                <p className="text-[12.5px] text-slate-400">Title, category, and instructions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Task Title" required>
              <Input name="title" placeholder="e.g. Product Review Categorization" required />
            </FormField>
            <FormField label="Category" required>
              <Select name="category" required>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Description">
              <Textarea
                name="description"
                rows={3}
                placeholder="What workers need to know about this task"
              />
            </FormField>
            <FormField label="Instructions">
              <Textarea
                name="instructions"
                rows={4}
                placeholder="Step-by-step instructions for completing the work"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Section 2: Pricing & Volume */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}>
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-800">Pricing &amp; Volume</h2>
                <p className="text-[12.5px] text-slate-400">Set reward per unit and total units needed</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Reward per Unit ($)" required>
                <Input
                  name="rewardPerUnit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.50"
                  required
                />
              </FormField>
              <FormField label="Total Units" required>
                <Input
                  name="totalUnits"
                  type="number"
                  min="1"
                  placeholder="100"
                  required
                />
              </FormField>
            </div>
            <div className="mt-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[12.5px] text-slate-500">
                The total budget will be calculated as <strong>Reward/Unit × Total Units</strong>.
                Funds will be deducted from your wallet when the task is published.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Form Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}>
                  <LayoutList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-slate-800">Form Fields</h2>
                  <p className="text-[12.5px] text-slate-400">Define what workers will fill in</p>
                </div>
              </div>
              {!showAddField && (
                <button
                  type="button"
                  onClick={() => setShowAddField(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[12.5px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              )}
            </div>
          </CardHeader>

          {/* Existing fields list */}
          {fields.length > 0 && (
            <div className="divide-y divide-slate-50 border-b border-slate-100">
              {fields.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-slate-700">{f.label}</p>
                    <p className="text-[12.5px] text-slate-400 mt-0.5">
                      <code className="bg-slate-100 px-1 rounded text-[11.5px]">{f.name}</code>
                      {" · "}
                      {f.type}
                      {f.required ? " · required" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fields.length === 0 && !showAddField && (
            <div className="px-6 py-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <LayoutList className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-[13.5px] text-slate-600">No fields added yet</p>
              <p className="text-[12.5px] text-slate-400 mt-0.5">Add at least one field for workers to fill in</p>
            </div>
          )}

          {/* Add field form */}
          {showAddField && (
            <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-100 space-y-4">
              <p className="text-[13px] font-semibold text-slate-700">New Field</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Field Name (code)">
                  <Input
                    placeholder="e.g. category"
                    value={newField.name ?? ""}
                    onChange={(e) => setNewField((p) => ({ ...p, name: e.target.value }))}
                  />
                </FormField>
                <FormField label="Field Label">
                  <Input
                    placeholder="e.g. Product Category"
                    value={newField.label ?? ""}
                    onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))}
                  />
                </FormField>
                <FormField label="Type">
                  <Select
                    value={newField.type ?? "text"}
                    onChange={(e) =>
                      setNewField((p) => ({ ...p, type: e.target.value as FieldType }))
                    }
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Required?">
                  <Select
                    value={newField.required ? "yes" : "no"}
                    onChange={(e) =>
                      setNewField((p) => ({ ...p, required: e.target.value === "yes" }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Select>
                </FormField>
              </div>
              {newField.type === "select" && (
                <FormField label="Options (comma-separated)">
                  <Input
                    placeholder="Option A, Option B, Option C"
                    onChange={(e) =>
                      setNewField((p) => ({
                        ...p,
                        options: e.target.value.split(",").map((s) => s.trim()),
                      }))
                    }
                  />
                </FormField>
              )}
              <div className="flex gap-2">
                <Button type="button" onClick={addField} variant="secondary">
                  <Plus className="w-4 h-4" />
                  Add Field
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddField(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Button type="submit" className="flex-1 py-2.5" loading={isPending}>
            Create Task (Draft)
          </Button>
          <a
            href="/business/tasks"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
