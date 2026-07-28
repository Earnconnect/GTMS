"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Circle } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { markInterviewAttendedAction } from "@/server/actions/interview.actions";

export function InterviewRoom({
  interviewId,
  candidateName,
  candidateEmail,
  round,
  meetingCode,
}: {
  interviewId: string;
  candidateName: string | null;
  candidateEmail: string;
  round: string;
  meetingCode: string;
}) {
  const [joined, setJoined] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!joined) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [joined]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  async function join() {
    setJoined(true);
    await markInterviewAttendedAction(interviewId);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-soft">
      {/* Stage */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-slate-800 to-slate-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        {/* Interviewer tile */}
        <div className="absolute inset-0 grid place-items-center">
          {joined ? (
            <div className="flex flex-col items-center gap-3 text-white/90">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 text-3xl font-semibold">
                HR
              </div>
              <p className="text-sm font-medium">GTMS Recruiter</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white">
                <Circle className="h-2 w-2 fill-current" /> Live · {mmss}
              </span>
            </div>
          ) : (
            <div className="text-center text-white/70">
              <Users className="mx-auto h-10 w-10" />
              <p className="mt-3 text-sm">Ready to join your {round.toLowerCase()} interview?</p>
              <p className="mt-1 text-xs text-white/40">Meeting code {meetingCode}</p>
            </div>
          )}
        </div>

        {/* Candidate PiP */}
        <div className="absolute bottom-4 right-4 flex h-28 w-40 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur">
          {cam ? (
            <Avatar name={candidateName} email={candidateEmail} size={44} />
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-700 text-slate-300">
              <VideoOff className="h-5 w-5" />
            </div>
          )}
          <span className="max-w-[9rem] truncate text-xs text-white/70">
            {candidateName ?? "You"} {!mic && "· muted"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 bg-slate-950 px-4 py-4">
        {!joined ? (
          <Button variant="success" onClick={join} className="gap-2">
            <Video className="h-4 w-4" /> Join interview
          </Button>
        ) : (
          <>
            <button
              onClick={() => setMic((m) => !m)}
              className={`grid h-11 w-11 place-items-center rounded-full ${mic ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
            >
              {mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setCam((c) => !c)}
              className={`grid h-11 w-11 place-items-center rounded-full ${cam ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
            >
              {cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setJoined(false)}
              className="grid h-11 w-11 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
