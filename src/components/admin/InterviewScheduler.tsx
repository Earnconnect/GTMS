"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Video } from "lucide-react";
import { scheduleInterviewAction, completeInterviewAction } from "@/server/actions/interview.actions";
import { Button, Input, Select } from "@/components/ui";

export function InterviewScheduler({
  applicationId,
  interview,
}: {
  applicationId: string;
  interview: { id: string; scheduledAt: string; round: string; status: string; meetingCode: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function schedule(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await scheduleInterviewAction({
        applicationId,
        scheduledAt: String(formData.get("scheduledAt") ?? ""),
        round: String(formData.get("round") ?? "Screening"),
        durationMins: Number(formData.get("durationMins") ?? 30),
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function outcome(status: "COMPLETED" | "NO_SHOW") {
    start(async () => {
      if (interview) {
        await completeInterviewAction({ interviewId: interview.id, status });
        router.refresh();
      }
    });
  }

  if (interview && interview.status === "SCHEDULED") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700">
          <Video className="h-3 w-3" /> {new Date(interview.scheduledAt).toLocaleString()} · {interview.round}
        </span>
        <Link
          href={`/interview/${interview.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 font-medium text-white hover:bg-brand-700"
        >
          <Video className="h-3 w-3" /> Join
        </Link>
        <Button size="sm" variant="success" disabled={pending} onClick={() => outcome("COMPLETED")}>
          Mark done
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => outcome("NO_SHOW")}>
          No-show
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1">
        <CalendarPlus className="h-3.5 w-3.5" /> {interview ? "Reschedule" : "Schedule interview"}
      </Button>
    );
  }

  return (
    <form action={schedule} className="flex flex-wrap items-end gap-2">
      <Input type="datetime-local" name="scheduledAt" required className="w-52 text-xs" />
      <Select name="round" defaultValue="Screening" className="w-32 text-xs">
        <option>Screening</option>
        <option>Technical</option>
        <option>Final</option>
      </Select>
      <Select name="durationMins" defaultValue="30" className="w-24 text-xs">
        <option value="15">15 min</option>
        <option value="30">30 min</option>
        <option value="45">45 min</option>
        <option value="60">60 min</option>
      </Select>
      <Button size="sm" type="submit" disabled={pending}>
        {pending ? "…" : "Schedule"}
      </Button>
      <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {error && <span className="w-full text-xs text-red-600">{error}</span>}
    </form>
  );
}
