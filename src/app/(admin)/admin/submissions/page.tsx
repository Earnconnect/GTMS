import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import SubmissionActions from "./SubmissionActions";

const PAGE_SIZE = 25;

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Auto-Approved", value: "AUTO_APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const badgeVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  AUTO_APPROVED: "success",
  REJECTED: "danger",
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();

  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const statusFilter = (statusParam ?? "ALL").toUpperCase() as StatusFilter;

  const where =
    statusFilter === "ALL"
      ? {}
      : { status: statusFilter as "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED" };

  const [submissions, total, pendingCount] = await Promise.all([
    db.submission.findMany({
      where,
      include: {
        worker: { select: { name: true, email: true, id: true } },
        assignment: {
          include: {
            task: { select: { title: true, rewardPerUnitCents: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.submission.count({ where }),
    db.submission.count({ where: { status: "PENDING" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildHref = (p: number, s?: StatusFilter) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    const st = s ?? statusFilter;
    if (st !== "ALL") params.set("status", st.toLowerCase());
    const q = params.toString();
    return `/admin/submissions${q ? `?${q}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Submission Review"
        description={`${total} submission${total !== 1 ? "s" : ""}`}
        action={
          pendingCount > 0 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              {pendingCount} pending
            </span>
          ) : undefined
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(1, tab.value)}
            className={[
              "px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-cyan-500 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card>
        {submissions.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-400">
            No submissions found.
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide rounded-t-2xl">
              <span>Worker</span>
              <span>Task</span>
              <span>Date</span>
              <span>Reward</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr] gap-2 md:gap-4 px-6 py-4 items-start md:items-center"
                >
                  {/* Worker */}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {sub.worker.name ?? sub.worker.email}
                    </p>
                    <p className="text-[11.5px] text-slate-400">{sub.worker.email}</p>
                  </div>

                  {/* Task */}
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">
                      {sub.assignment.task.title}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </div>

                  {/* Reward */}
                  <div className="text-sm font-semibold text-emerald-600">
                    {formatMoney(sub.assignment.task.rewardPerUnitCents)}
                  </div>

                  {/* Status */}
                  <div>
                    <Badge variant={badgeVariant[sub.status] ?? "default"}>
                      {sub.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div>
                    {sub.status === "PENDING" ? (
                      <SubmissionActions submissionId={sub.id} />
                    ) : (
                      <span className="text-xs text-slate-400">
                        {sub.reviewedAt
                          ? `Reviewed ${new Date(sub.reviewedAt).toLocaleDateString()}`
                          : "—"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-[13px] text-slate-500">
            Page {page} of {totalPages} &mdash; {total} total
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref(page - 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref(page + 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
