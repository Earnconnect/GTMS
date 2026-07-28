import { z } from "zod";

// A task's output form is a list of fields the worker fills in for each unit.
// Stored on Task.fieldSchema as { fields: FieldDef[] }.

export const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "url",
  "select",
  "radio",
  "boolean",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select / radio
  placeholder?: string;
}

export interface TaskFieldSchema {
  fields: FieldDef[];
}

export const fieldDefSchema: z.ZodType<FieldDef> = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Key must be alphanumeric/underscore"),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional(),
  options: z.array(z.string().min(1)).optional(),
  placeholder: z.string().optional(),
});

export const taskFieldSchemaSchema = z.object({
  fields: z.array(fieldDefSchema).min(1, "Add at least one field"),
});

/** Parse an unknown JSON value into a TaskFieldSchema (safe). */
export function parseFieldSchema(value: unknown): TaskFieldSchema {
  const result = taskFieldSchemaSchema.safeParse(value);
  return result.success ? result.data : { fields: [] };
}

/** Build a zod schema that validates a worker's submission `data` object. */
export function buildSubmissionSchema(fields: FieldDef[]): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const f of fields) {
    let base: z.ZodTypeAny;
    switch (f.type) {
      case "number":
        base = z.coerce.number();
        break;
      case "boolean":
        base = z.coerce.boolean();
        break;
      case "url":
        base = z.string().url();
        break;
      case "select":
      case "radio":
        base = f.options && f.options.length > 0 ? z.enum(f.options as [string, ...string[]]) : z.string();
        break;
      default:
        base = z.string();
    }

    if (f.required) {
      if (base instanceof z.ZodString) base = base.min(1, `${f.label} is required`);
      shape[f.key] = base;
    } else {
      shape[f.key] = base.optional().or(z.literal(""));
    }
  }

  return z.object(shape);
}
