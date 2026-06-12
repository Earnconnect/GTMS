import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardContent, CardHeader, Badge, EmptyState } from "@/components/ui";
import CopyButton from "./CopyButton";

export default async function ReferralsPage() {
  const user = await requireWorker();

  const [worker, referrals] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { referralCode: true } }),
    db.referral.findMany({
      where: { referrerId: user.id },
      include: { referee: { select: { name: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralLink = `${baseUrl}/register?ref=${worker?.referralCode}`;
  const bonusAwarded = referrals.filter((r) => r.bonusAwarded).length;
  const pending = referrals.length - bonusAwarded;

  return (
    <div>
      <PageHeader
        title="Referrals"
        description="Invite friends and earn bonuses when they complete their first task"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Total Referrals</p>
          <p className="mt-1.5 text-[28px] font-bold leading-none text-cyan-600">{referrals.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Bonuses Earned</p>
          <p className="mt-1.5 text-[28px] font-bold leading-none text-emerald-600">{bonusAwarded}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
          <p className="mt-1.5 text-[28px] font-bold leading-none text-amber-500">{pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Your Code</p>
          <p className="mt-1.5 text-[20px] font-bold leading-none text-slate-800 tracking-wider font-mono">
            {worker?.referralCode ?? "—"}
          </p>
        </div>
      </div>

      {/* Referral link card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">Your Referral Link</h2>
          <p className="text-[12.5px] text-slate-400 mt-0.5">
            Share this link. When your referral completes their first task, you both earn a bonus.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
              </svg>
              <code className="text-[13px] text-slate-600 truncate flex-1">{referralLink}</code>
            </div>
            <CopyButton text={referralLink} />
          </div>

          {worker?.referralCode && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                <span className="text-[13px] text-slate-500">Code:</span>
                <code className="text-[13px] font-bold text-slate-800 tracking-wider">{worker.referralCode}</code>
              </div>
              <CopyButton text={worker.referralCode} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals table */}
      {referrals.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No referrals yet"
              description="Share your link to start earning referral bonuses."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Your Referrals</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left">
                    Name
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left">
                    Joined
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                        >
                          {(r.referee.name ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13.5px] font-semibold text-slate-700">
                          {r.referee.name ?? "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13.5px] text-slate-500">
                      {new Date(r.referee.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {r.bonusAwarded ? (
                        <Badge variant="success">Bonus Earned</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
