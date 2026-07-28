import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, Calendar, Clock } from "lucide-react";
import { requireUser } from "@/server/rbac";
import { db } from "@/server/db";
import { SectionCard, Badge } from "@/components/ui";
import { InterviewRoom } from "@/components/interviews/InterviewRoom";
import { RealInterviewRoom } from "@/components/interviews/RealInterviewRoom";
import { isVideoEnabled } from "@/server/services/video.service";

const TIPS = [
  "Find a quiet, well-lit space and test your camera and mic.",
  "Have a copy of the role description and your notes handy.",
  "Prepare one or two questions about the team and expectations.",
  "Be ready to talk through your relevant experience with specifics.",
];

export default async function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const interview = await db.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          applicant: { select: { name: true, email: true } },
          job: { select: { title: true, department: true } },
        },
      },
    },
  });

  // Both the candidate and admins (interviewers) may enter the room.
  const canAccess =
    interview &&
    (interview.application.applicantId === user.id || user.role === "ADMIN");
  if (!interview || !canAccess) notFound();

  const videoLive = isVideoEnabled();

  return (
    <div className="space-y-6">
      <Link href="/interviews" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to interviews
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {interview.application.job.title}
          </h1>
          <Badge tone="blue">{interview.round}</Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {interview.scheduledAt.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" /> {interview.durationMins} minutes
          </span>
          <span>{interview.application.job.department}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {videoLive ? (
            <RealInterviewRoom
              interviewId={interview.id}
              round={interview.round}
              meetingCode={interview.meetingCode}
            />
          ) : (
            <InterviewRoom
              interviewId={interview.id}
              candidateName={interview.application.applicant.name}
              candidateEmail={interview.application.applicant.email}
              round={interview.round}
              meetingCode={interview.meetingCode}
            />
          )}
        </div>
        <SectionCard title="Interview prep" description="A few tips to help you shine.">
          <ul className="space-y-3">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-600">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {t}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
