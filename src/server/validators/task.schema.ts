import { z } from "zod";
import { fieldDefSchema } from "@/lib/fields";
import { TASK_CATEGORIES } from "@/lib/constants";

export const createTaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(1).max(2000),
  instructions: z.string().min(1).max(5000),
  category: z.enum(TASK_CATEGORIES as unknown as [string, ...string[]]),
  // dollars from the form, converted to cents in the action
  rewardPerUnitCents: z.number().int().positive().max(1_000_00),
  maxPerWorker: z.number().int().positive().max(10_000).default(1),
  reviewWindowH: z.number().int().min(1).max(720).default(72),
  reservationTtlM: z.number().int().min(5).max(1440).default(30),
  fields: z.array(fieldDefSchema).min(1, "Add at least one field"),
  /**
   * Per-unit input items shown to workers. If empty, `unitCount` identical
   * units (no per-unit input — e.g. a survey) are created instead.
   */
  items: z.array(z.record(z.string(), z.any())).default([]),
  unitCount: z.number().int().positive().max(10_000).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
