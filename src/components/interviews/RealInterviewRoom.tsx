"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyCall } from "@daily-co/daily-js";
import { Video, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { getInterviewJoinInfoAction } from "@/server/actions/interview.actions";

export function RealInterviewRoom({
  interviewId,
  round,
  meetingCode,
}: {
  interviewId: string;
  round: string;
  meetingCode: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [state, setState] = useState<"idle" | "joining" | "in-call" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      callRef.current?.destroy();
      callRef.current = null;
    };
  }, []);

  async function join() {
    setError(null);
    setState("joining");
    try {
      const info = await getInterviewJoinInfoAction(interviewId);
      if (info.error || !info.roomUrl || !info.token) {
        setError(info.error ?? "Could not join the room.");
        setState("error");
        return;
      }
      const DailyIframe = (await import("@daily-co/daily-js")).default;
      // Only one call object may exist at a time.
      callRef.current?.destroy();
      const frame = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: true,
        iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "1rem" },
      });
      callRef.current = frame;
      frame.on("left-meeting", () => setState("idle"));
      await frame.join({ url: info.roomUrl, token: info.token });
      setState("in-call");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video failed to start.");
      setState("error");
    }
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
      >
        {state !== "in-call" && (
          <div className="absolute inset-0 grid place-items-center text-center text-white/80">
            {state === "joining" ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Connecting to your interview…</p>
              </div>
            ) : state === "error" ? (
              <div className="flex max-w-sm flex-col items-center gap-3 px-6">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
                <Button size="sm" variant="secondary" onClick={join}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Video className="h-9 w-9" />
                <p className="text-sm">Ready to join your {round.toLowerCase()} interview?</p>
                <p className="text-xs text-white/40">Meeting code {meetingCode}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {state === "idle" && (
        <div className="mt-4 flex justify-center">
          <Button variant="success" onClick={join} className="gap-2">
            <Video className="h-4 w-4" /> Join interview
          </Button>
        </div>
      )}
    </div>
  );
}
