import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardContent, CardHeader } from "@/components/ui";

function ScoreGauge({
  label,
  value,
  strokeColor,
  trackColor,
  valueColor,
  bgColor,
  description,
}: {
  label: string;
  value: number;
  strokeColor: string;
  trackColor: string;
  valueColor: string;
  bgColor: string;
  description: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc (three-quarter circle) for a nice gauge look
  const arcLength = circumference * 0.75;
  const offset = arcLength - (Math.min(value, 100) / 100) * arcLength;

  return (
    <Card className="flex flex-col items-center text-center p-6">
      <div className="relative inline-flex items-center justify-center mb-4" style={{ width: 104, height: 104 }}>
        <svg width="104" height="104" viewBox="0 0 100 100" style={{ transform: "rotate(135deg)" }}>
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth="9"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="9"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[26px] font-bold leading-none ${valueColor}`}>
            {Math.round(value)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold mb-2 ${bgColor}`}>
        <span className={valueColor}>{label}</span>
      </div>
      <p className="text-[12.5px] text-slate-400 max-w-[150px]">{description}</p>
    </Card>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-semibold text-slate-700">{label}</span>
        <span className="text-[13px] font-bold text-slate-800">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default async function PerformancePage() {
  const user = await requireWorker();

  const workerUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      accuracyScore: true,
      speedScore: true,
      consistencyScore: true,
      trustScore: true,
      _count: {
        select: {
          workerSubs: {
            where: { status: { in: ["APPROVED", "AUTO_APPROVED", "REJECTED", "PENDING"] } },
          },
        },
      },
    },
  });

  const approved = await db.submission.count({
    where: { workerId: user.id, status: { in: ["APPROVED", "AUTO_APPROVED"] } },
  });
  const rejected = await db.submission.count({
    where: { workerId: user.id, status: "REJECTED" },
  });

  const accuracy = workerUser?.accuracyScore ?? 50;
  const speed = workerUser?.speedScore ?? 50;
  const consistency = workerUser?.consistencyScore ?? 50;
  const trust = workerUser?.trustScore ?? 50;
  const total = workerUser?._count.workerSubs ?? 0;

  const overallGrade = trust >= 85 ? "Excellent" : trust >= 70 ? "Good" : trust >= 50 ? "Average" : "Needs Work";
  const gradeColor = trust >= 85 ? "text-emerald-600" : trust >= 70 ? "text-cyan-600" : trust >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <div>
      <PageHeader
        title="Performance"
        description="Your workforce quality metrics and score breakdown"
      />

      {/* Score Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ScoreGauge
          label="Accuracy"
          value={accuracy}
          strokeColor="#10b981"
          trackColor="#d1fae5"
          valueColor="text-emerald-600"
          bgColor="bg-emerald-50"
          description="Approved vs rejected submissions"
        />
        <ScoreGauge
          label="Speed"
          value={speed}
          strokeColor="#06b6d4"
          trackColor="#cffafe"
          valueColor="text-cyan-600"
          bgColor="bg-cyan-50"
          description="Completion time vs task median"
        />
        <ScoreGauge
          label="Consistency"
          value={consistency}
          strokeColor="#f59e0b"
          trackColor="#fef3c7"
          valueColor="text-amber-600"
          bgColor="bg-amber-50"
          description="Long-term reliability and stability"
        />
        <ScoreGauge
          label="Trust"
          value={trust}
          strokeColor="#8b5cf6"
          trackColor="#ede9fe"
          valueColor="text-violet-600"
          bgColor="bg-violet-50"
          description="Overall composite score"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Submission Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Submission Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-emerald-50 py-4">
                <p className="text-[28px] font-bold text-emerald-600">{approved}</p>
                <p className="text-[12px] font-semibold text-emerald-500 mt-0.5">Approved</p>
              </div>
              <div className="rounded-xl bg-red-50 py-4">
                <p className="text-[28px] font-bold" style={{ color: "#F56565" }}>{rejected}</p>
                <p className="text-[12px] font-semibold text-red-400 mt-0.5">Rejected</p>
              </div>
              <div className="rounded-xl bg-slate-50 py-4">
                <p className="text-[28px] font-bold text-slate-700">{total}</p>
                <p className="text-[12px] font-semibold text-slate-400 mt-0.5">Total</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[13px] text-slate-500">Overall grade</span>
              <span className={`text-[15px] font-bold ${gradeColor}`}>{overallGrade}</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown bars */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Score Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScoreBar label="Accuracy" value={accuracy} color="#10b981" />
              <ScoreBar label="Speed" value={speed} color="linear-gradient(90deg,#06B6D4,#0284C7)" />
              <ScoreBar label="Consistency" value={consistency} color="#f59e0b" />
              <ScoreBar label="Trust Score" value={trust} color="#8b5cf6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score explanations */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">How scores are calculated</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Accuracy",
                color: "bg-emerald-50 text-emerald-600",
                dot: "bg-emerald-500",
                text: "Ratio of approved to total reviewed submissions over the past 90 days.",
              },
              {
                label: "Speed",
                color: "bg-cyan-50 text-cyan-600",
                dot: "bg-cyan-500",
                text: "Your average completion time compared to the task-type median.",
              },
              {
                label: "Consistency",
                color: "bg-amber-50 text-amber-600",
                dot: "bg-amber-500",
                text: "Stability of your accuracy score measured across multiple time windows.",
              },
              {
                label: "Trust",
                color: "bg-violet-50 text-violet-600",
                dot: "bg-violet-500",
                text: "Weighted composite: 50% accuracy, 20% speed, 20% consistency, 10% tenure.",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 p-4 rounded-xl bg-slate-50">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`} />
                <div>
                  <p className="text-[13px] font-semibold text-slate-700 mb-0.5">{item.label}</p>
                  <p className="text-[12.5px] text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
