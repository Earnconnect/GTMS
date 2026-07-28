import type { FieldDef } from "@/lib/fields";
import { Input, Textarea, Select, Label } from "@/components/ui";

/** Renders a single task field as a form input named by its key. */
export function FieldRenderer({ field }: { field: FieldDef }) {
  const name = field.key;
  const required = field.required;

  return (
    <div>
      <Label htmlFor={name}>
        {field.label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>

      {field.type === "textarea" && (
        <Textarea id={name} name={name} required={required} rows={4} placeholder={field.placeholder} />
      )}

      {field.type === "text" && (
        <Input id={name} name={name} required={required} placeholder={field.placeholder} />
      )}

      {field.type === "url" && (
        <Input id={name} name={name} type="url" required={required} placeholder={field.placeholder ?? "https://"} />
      )}

      {field.type === "number" && (
        <Input id={name} name={name} type="number" required={required} placeholder={field.placeholder} />
      )}

      {field.type === "boolean" && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name={name} value="true" /> Yes
        </label>
      )}

      {(field.type === "select") && (
        <Select id={name} name={name} required={required} defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      )}

      {field.type === "radio" && (
        <div className="space-y-1">
          {field.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name={name} value={o} required={required} />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
