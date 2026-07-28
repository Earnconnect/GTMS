"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ChevronDown, Clock, Lock } from "lucide-react";
import { completeModuleAction } from "@/server/actions/training.actions";
import { Button } from "@/components/ui";
import { clsx } from "@/lib/cn";

type Module = { id: string; order: number; title: string; content: string; durationMins: number };

export function ModuleList({
  courseId,
  modules,
  completedIds,
}: {
  courseId: string;
  modules: Module[];
  completedIds: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const done = new Set(completedIds);
  const firstIncomplete = modules.find((m) => !done.has(m.id))?.id;
  const [openId, setOpenId] = useState<string | null>(firstIncomplete ?? modules[0]?.id ?? null);

  function complete(moduleId: string) {
    start(async () => {
      await completeModuleAction({ courseId, moduleId });
      router.refresh();
    });
  }

  return (
    <ol className="space-y-3">
      {modules.map((m, idx) => {
        const isDone = done.has(m.id);
        const locked = idx > 0 && !done.has(modules[idx - 1].id) && !isDone;
        const open = openId === m.id;
        return (
          <li key={m.id} className="overflow-hidden rounded-xl border border-slate-200">
            <button
              onClick={() => !locked && setOpenId(open ? null : m.id)}
              disabled={locked}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left",
                locked ? "cursor-not-allowed opacity-60" : "hover:bg-slate-50",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : locked ? (
                <Lock className="h-5 w-5 shrink-0 text-slate-300" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span className="flex-1">
                <span className="block text-sm font-medium text-slate-800">
                  {idx + 1}. {m.title}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" /> {m.durationMins} min
                </span>
              </span>
              {!locked && (
                <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
              )}
            </button>
            {open && !locked && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{m.content}</p>
                <div className="mt-4">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </span>
                  ) : (
                    <Button size="sm" variant="success" disabled={pending} onClick={() => complete(m.id)}>
                      {pending ? "Saving…" : "Mark module complete"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
