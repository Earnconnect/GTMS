"use client";

import { useActionState, useEffect, useState } from "react";
import { submitWorkAction } from "@/server/actions/task.actions";
import { Button, Input, Textarea, Select, FormField, Alert } from "@/components/ui";
import type { FieldDef } from "@/lib/fields";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

function WordCount({ value, minWords }: { value: string; minWords?: number }) {
  const count = value.trim() ? value.trim().split(/\s+/).length : 0;
  const tooShort = minWords ? count < minWords : false;
  return (
    <span className={`text-[11.5px] ${tooShort ? "text-amber-500" : "text-slate-400"}`}>
      {count} word{count !== 1 ? "s" : ""}
      {minWords ? ` / ${minWords} min` : ""}
    </span>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-1">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
            required={field.required}
            rows={4}
          />
          <div className="flex justify-end">
            <WordCount value={value} />
          </div>
        </div>
      );
    case "select":
      return (
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">Select an option...</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "boolean":
      return (
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      );
    default:
      return (
        <Input
          type={
            field.type === "number"
              ? "number"
              : field.type === "url"
              ? "url"
              : field.type === "date"
              ? "date"
              : "text"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          min={field.min}
          max={field.max}
        />
      );
  }
}

function ConfirmModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
          </div>
          <h3 className="text-[16px] font-bold text-slate-800">Submit your work?</h3>
        </div>
        <p className="text-[13.5px] text-slate-500 mb-5 leading-relaxed">
          Once submitted, you cannot edit your response. Make sure all fields are complete and accurate.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl text-[13.5px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Review Again
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl text-[13.5px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkForm({
  assignmentId,
  fieldSchema,
  expiresAt,
}: {
  assignmentId: string;
  fieldSchema: FieldDef[];
  expiresAt: string | null;
}) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(submitWorkAction, {});
  const [values, setValues] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        clearInterval(interval);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (state.success) router.push("/dashboard/submissions");
  }, [state.success, router]);

  const requiredFields = fieldSchema.filter((f) => f.required);
  const allRequiredFilled = requiredFields.every((f) => {
    const v = values[f.name] ?? "";
    return v.trim().length > 0;
  });

  const data = Object.fromEntries(
    fieldSchema.map((f) => [
      f.name,
      values[f.name] === "true"
        ? true
        : values[f.name] === "false"
        ? false
        : values[f.name] ?? "",
    ])
  );

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredFilled) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const form = document.getElementById("work-form") as HTMLFormElement | null;
    if (form) {
      // Trigger the actual form action submission
      const btn = document.getElementById("hidden-submit") as HTMLButtonElement | null;
      btn?.click();
    }
  };

  const timeIsLow = timeLeft && timeLeft !== "Expired" && (() => {
    const parts = timeLeft.split(":");
    const mins = parseInt(parts[0] ?? "0", 10);
    return mins < 5;
  })();

  return (
    <div>
      {/* Timer */}
      {timeLeft && (
        <div
          className={`mb-4 rounded-xl px-4 py-2.5 flex items-center gap-2 text-[13px] font-medium border ${
            isExpired
              ? "bg-red-50 text-red-700 border-red-200"
              : timeIsLow
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-600 border-slate-100"
          }`}
        >
          {isExpired ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 flex-shrink-0" />
          )}
          {isExpired ? "Reservation expired — this unit may be reassigned" : `Time remaining: ${timeLeft}`}
        </div>
      )}

      {state.error && (
        <Alert variant="danger" className="mb-4">
          {state.error}
        </Alert>
      )}

      {/* Required fields legend */}
      {requiredFields.length > 0 && (
        <p className="text-[12px] text-slate-400 mb-4">
          Fields marked <span className="text-red-500 font-semibold">*</span> are required.
        </p>
      )}

      <form id="work-form" action={action} onSubmit={handleSubmitClick}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <input type="hidden" name="data" value={JSON.stringify(data)} />

        <div className="space-y-5 mb-6">
          {fieldSchema.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              required={field.required}
            >
              <FieldInput
                field={field}
                value={values[field.name] ?? ""}
                onChange={(v) =>
                  setValues((prev) => ({ ...prev, [field.name]: v }))
                }
              />
            </FormField>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <Button
            type="submit"
            className="flex-1"
            disabled={!allRequiredFilled || isExpired}
          >
            Submit Work
          </Button>
          <a
            href="/browse"
            className="px-4 py-2 text-[13.5px] font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Abandon
          </a>
        </div>

        {!allRequiredFilled && (
          <p className="mt-2 text-[12px] text-slate-400 text-center">
            Complete all required fields to enable submission.
          </p>
        )}

        {/* Hidden button targeted by confirm modal */}
        <button
          id="hidden-submit"
          type="submit"
          aria-hidden="true"
          className="hidden"
        />
      </form>

      {showConfirm && (
        <ConfirmModal
          onConfirm={() => {
            setShowConfirm(false);
            handleConfirm();
          }}
          onCancel={() => setShowConfirm(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
