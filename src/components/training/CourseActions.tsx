"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollCourseAction, updateProgressAction } from "@/server/actions/training.actions";
import { Button } from "@/components/ui";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await enrollCourseAction(courseId);
          router.refresh();
        })
      }
    >
      {pending ? "Enrolling…" : "Enroll"}
    </Button>
  );
}

export function ProgressControl({
  enrollmentId,
  progressPct,
  moduleCount,
}: {
  enrollmentId: string;
  progressPct: number;
  moduleCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function bump() {
    const step = Math.ceil(100 / moduleCount);
    const next = Math.min(100, progressPct + step);
    start(async () => {
      await updateProgressAction({ enrollmentId, progressPct: next });
      router.refresh();
    });
  }

  if (progressPct >= 100) {
    return <span className="text-xs font-semibold text-emerald-700">Completed ✓</span>;
  }

  return (
    <Button size="sm" variant="secondary" onClick={bump} disabled={pending}>
      {pending ? "…" : "Complete next module"}
    </Button>
  );
}
