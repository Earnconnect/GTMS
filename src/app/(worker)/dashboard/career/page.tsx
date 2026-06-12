import { requireWorker } from "@/server/rbac";
import { getCareerProgress } from "@/server/services/career.service";
import { PageHeader, Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { CAREER_REQUIREMENTS } from "@/lib/career";
import type { CareerLevel } from "@/generated/prisma";

const LEVEL_ORDER: CareerLevel[] = [
  "DIGITAL_ASSOCIATE",
  "CERTIFIED_REVIEWER",
  "SENIOR_VERIFIER",
  "VERIFICATION_SPECIALIST",
  "TEAM_SUPERVISOR",
];

const LEVEL_UNLOCKS: Record<CareerLevel, string[]> = {
  DIGITAL_ASSOCIATE: [
    "Access to entry-level tasks",
    "Basic task queue",
    "Standard support",
  ],
  CERTIFIED_REVIEWER: [
    "QA review task access",
    "Higher reward tasks",
    "Priority queue placement",
  ],
  SENIOR_VERIFIER: [
    "Senior task pipeline",
    "Dispute arbitration rights",
    "Increased daily task cap",
  ],
  VERIFICATION_SPECIALIST: [
    "Expert-level project access",
    "Premium reward multiplier",
    "Specialist support channel",
  ],
  TEAM_SUPERVISOR: [
    "Full platform access",
    "Team management tools",
    "Maximum reward tier",
  ],
};

export default async function CareerPage() {
  const user = await requireWorker();
  const progress = await getCareerProgress(user.id);

  if (!progress) return null;

  const currentIdx = LEVEL_ORDER.indexOf(progress.current);

  return (
    <div>
      <PageHeader
        title="Career Progression"
        description="Track your advancement through the GTMS workforce levels"
      />

      {/* Current Level Banner */}
      <div
        className="rounded-2xl p-6 mb-6 text-white shadow-[0_4px_20px_rgba(6,182,212,0.25)]"
        style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[12.5px] font-semibold text-cyan-100 uppercase tracking-wider mb-1">
              Current Level
            </p>
            <h2 className="text-[26px] font-bold leading-tight">
              {CAREER_REQUIREMENTS[progress.current].label}
            </h2>
            <p className="text-[13.5px] text-cyan-100 mt-1">
              {CAREER_REQUIREMENTS[progress.current].description}
            </p>
          </div>
          {progress.next && (
            <div className="sm:text-right flex-shrink-0">
              <p className="text-[12.5px] text-cyan-200 mb-1">Progress to next level</p>
              <p className="text-[42px] font-bold leading-none">{progress.progress}%</p>
            </div>
          )}
        </div>

        {progress.next && (
          <div className="mt-5">
            <div className="flex justify-between text-[12px] text-cyan-200 mb-1.5">
              <span>{CAREER_REQUIREMENTS[progress.current].label}</span>
              <span>{CAREER_REQUIREMENTS[progress.next].label}</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}

        {!progress.next && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <span className="text-[13px] font-semibold">Maximum Level Reached</span>
          </div>
        )}
      </div>

      {/* Next Level Requirements */}
      {progress.next && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">
              Requirements for {CAREER_REQUIREMENTS[progress.next].label}
            </h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Complete all three to advance</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <RequirementItem
                label="Tasks Completed"
                current={progress.tasksCompleted}
                required={progress.nextReqs!.tasksCompleted}
              />
              <RequirementItem
                label="Accuracy Score"
                current={Math.round(progress.accuracyScore)}
                required={progress.nextReqs!.accuracyScore}
                suffix="%"
              />
              <RequirementItem
                label="Trust Score"
                current={Math.round(progress.trustScore)}
                required={progress.nextReqs!.trustScore}
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* What you unlock */}
      {progress.next && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">
              What unlocks at {CAREER_REQUIREMENTS[progress.next].label}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVEL_UNLOCKS[progress.next].map((unlock) => (
                <div key={unlock} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                  >
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-700 font-medium">{unlock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Roadmap */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">Career Roadmap</h2>
          <p className="text-[12.5px] text-slate-400 mt-0.5">Your journey through all 5 levels</p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-slate-100" />

            <div className="space-y-5">
              {LEVEL_ORDER.map((level, i) => {
                const req = CAREER_REQUIREMENTS[level];
                const isCompleted = currentIdx > i;
                const isCurrent = progress.current === level;
                const isLocked = currentIdx < i;

                return (
                  <div key={level} className="flex items-start gap-4 relative">
                    {/* Step indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                        : isCurrent
                        ? "border-cyan-500 bg-white shadow-[0_0_0_4px_rgba(6,182,212,0.12)]"
                        : "border-slate-200 bg-white"
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }} />
                      ) : (
                        <span className="text-[12px] font-bold text-slate-400">{i + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pb-1 rounded-xl px-4 py-3 border transition-all ${
                      isCurrent
                        ? "bg-cyan-50/60 border-cyan-100"
                        : isCompleted
                        ? "bg-emerald-50/40 border-emerald-100/60"
                        : "bg-white border-slate-100"
                    }`}>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className={`text-[14px] font-semibold ${isLocked ? "text-slate-400" : "text-slate-800"}`}>
                          {req.label}
                        </p>
                        {isCurrent && <Badge variant="cyan">Current</Badge>}
                        {isCompleted && <Badge variant="success">Completed</Badge>}
                        {isLocked && <Badge variant="default">Locked</Badge>}
                      </div>
                      <p className={`text-[12.5px] ${isLocked ? "text-slate-300" : "text-slate-500"}`}>
                        {req.description}
                      </p>
                      {level !== "DIGITAL_ASSOCIATE" && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-md ${isLocked ? "bg-slate-50 text-slate-300" : "bg-white text-slate-500 border border-slate-100"}`}>
                            {req.tasksCompleted} tasks
                          </span>
                          <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-md ${isLocked ? "bg-slate-50 text-slate-300" : "bg-white text-slate-500 border border-slate-100"}`}>
                            {req.accuracyScore}% accuracy
                          </span>
                          <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-md ${isLocked ? "bg-slate-50 text-slate-300" : "bg-white text-slate-500 border border-slate-100"}`}>
                            {req.trustScore} trust score
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RequirementItem({
  label,
  current,
  required,
  suffix = "",
}: {
  label: string;
  current: number;
  required: number;
  suffix?: string;
}) {
  const pct = Math.min(100, (current / required) * 100);
  const met = current >= required;

  return (
    <div className={`rounded-xl p-4 border ${met ? "bg-emerald-50/60 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
      <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-[22px] font-bold leading-tight ${met ? "text-emerald-600" : "text-slate-800"}`}>
        {current}{suffix}
        <span className="text-[14px] font-normal text-slate-400"> / {required}{suffix}</span>
      </p>
      <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${met ? "bg-emerald-500" : ""}`}
          style={{
            width: `${pct}%`,
            background: met ? undefined : "linear-gradient(90deg,#06B6D4,#0284C7)",
          }}
        />
      </div>
      <p className={`text-[11.5px] font-semibold mt-1.5 ${met ? "text-emerald-600" : "text-slate-400"}`}>
        {met ? "Requirement met" : `${Math.round(pct)}% complete`}
      </p>
    </div>
  );
}
