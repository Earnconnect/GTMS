import { requireWorker } from "@/server/rbac";
import { getLeaderboard } from "@/server/services/leaderboard.service";
import { PageHeader, Card, CardContent, CardHeader, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { CAREER_REQUIREMENTS } from "@/lib/career";
import type { CareerLevel, LeaderboardPeriod } from "@/generated/prisma";

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  ALL_TIME: "All Time",
};

const MEDAL_CONFIG = [
  { bg: "bg-amber-50", ring: "ring-amber-300", text: "text-amber-600", label: "1st", emoji: "🥇" },
  { bg: "bg-slate-50",  ring: "ring-slate-300",  text: "text-slate-500",  label: "2nd", emoji: "🥈" },
  { bg: "bg-orange-50", ring: "ring-orange-300", text: "text-orange-500", label: "3rd", emoji: "🥉" },
];

function Avatar({ name }: { name: string }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
      style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
    >
      {initials}
    </div>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const currentUser = await requireWorker();
  const params = await searchParams;
  const period = (params.period ?? "WEEKLY") as LeaderboardPeriod;

  const leaders = await getLeaderboard(period, 50);

  const topThree = (leaders as Record<string, unknown>[]).slice(0, 3);
  const rest = (leaders as Record<string, unknown>[]).slice(3);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Top earners on the GTMS Workforce Network"
      />

      {/* Period tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["WEEKLY", "MONTHLY", "ALL_TIME"] as LeaderboardPeriod[]).map((p) => (
          <a
            key={p}
            href={`/dashboard/leaderboard?period=${p}`}
            className={`h-10 px-5 inline-flex items-center rounded-full text-[13.5px] font-semibold transition-all ${
              period === p
                ? "text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
            style={period === p ? { background: "linear-gradient(135deg,#06B6D4,#0284C7)" } : undefined}
          >
            {PERIOD_LABELS[p]}
          </a>
        ))}
      </div>

      {leaders.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No data yet"
              description="The leaderboard will populate once workers start earning."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-[15px] font-semibold text-slate-800">Top Performers</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center gap-4">
                  {/* Reorder: 2nd | 1st | 3rd for podium look on desktop */}
                  {[
                    topThree[1],
                    topThree[0],
                    topThree[2],
                  ]
                    .filter(Boolean)
                    .map((entry, displayIdx) => {
                      const e = entry as Record<string, unknown>;
                      // Map display position back to actual rank
                      const actualRank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
                      const medal = MEDAL_CONFIG[actualRank - 1];
                      const name = (e.name as string | undefined) ?? "Worker";
                      const earnings = (e.totalEarnedCents as number | undefined) ?? (e.earningsCents as number | undefined) ?? 0;
                      const careerLevel = e.careerLevel as CareerLevel | undefined;

                      const podiumHeight = actualRank === 1 ? "sm:pb-8" : actualRank === 2 ? "sm:pb-4" : "sm:pb-2";

                      return (
                        <div
                          key={String(e.id ?? displayIdx)}
                          className={`flex-1 flex flex-col items-center text-center ${podiumHeight}`}
                        >
                          <div className="text-2xl mb-2">{medal.emoji}</div>
                          <div className={`w-16 h-16 rounded-full ring-4 ${medal.ring} flex items-center justify-center text-white text-[18px] font-bold mb-3 shadow-sm`}
                            style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-[14px] font-bold text-slate-800 leading-tight">{name}</p>
                          {careerLevel && (
                            <p className="text-[11.5px] text-slate-400 mt-0.5">
                              {CAREER_REQUIREMENTS[careerLevel].label}
                            </p>
                          )}
                          <p className="text-[16px] font-bold mt-2" style={{ color: "#F56565" }}>
                            {formatMoney(earnings)}
                          </p>
                          <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${medal.bg} ${medal.text}`}>
                            {medal.label} Place
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rank 4+ table */}
          {rest.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-[15px] font-semibold text-slate-800">Rankings</h2>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left w-14">Rank</th>
                      <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left">Worker</th>
                      <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-right">Earnings</th>
                      <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((entry: Record<string, unknown>, i: number) => {
                      const rank = (entry.rank as number | undefined) ?? i + 4;
                      const name = (entry.name as string | undefined) ?? "Worker";
                      const earnings = (entry.totalEarnedCents as number | undefined) ?? (entry.earningsCents as number | undefined) ?? 0;
                      const accuracy = (entry.accuracyScore as number | undefined) ?? 0;
                      const careerLevel = entry.careerLevel as CareerLevel | undefined;
                      const isCurrentUser = entry.id === currentUser.id;

                      return (
                        <tr
                          key={String(entry.id ?? i)}
                          className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                            isCurrentUser ? "bg-cyan-50/40" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 text-[13.5px] text-slate-700">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-[12px] font-bold">
                              {rank}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={name} />
                              <div>
                                <p className={`text-[13.5px] font-semibold ${isCurrentUser ? "text-cyan-700" : "text-slate-700"}`}>
                                  {name}
                                  {isCurrentUser && (
                                    <span className="ml-1.5 text-[10.5px] font-semibold text-cyan-500 bg-cyan-50 px-1.5 py-0.5 rounded-full">You</span>
                                  )}
                                </p>
                                {careerLevel && (
                                  <p className="text-[11.5px] text-slate-400">
                                    {CAREER_REQUIREMENTS[careerLevel].label}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-[13.5px] font-semibold" style={{ color: "#F56565" }}>
                              {formatMoney(earnings)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right text-[13.5px] text-slate-500">
                            {accuracy.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
