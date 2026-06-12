import { requireAdmin } from "@/server/rbac";
import {
  listNotifications,
  markAllRead,
  getUnreadCount,
} from "@/server/services/notification.service";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Banknote,
  ShieldCheck,
  Star,
  AlertTriangle,
  MessageSquare,
  Gift,
  Award,
  Clock,
  TrendingUp,
  Gem,
  Lock,
} from "lucide-react";
import { PageHeader, Card, CardHeader, EmptyState } from "@/components/ui";
import type { NotificationType } from "@/generated/prisma";

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
    TASK_APPROVED: { icon: <CheckCheck className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100" },
    TASK_REJECTED: { icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, bg: "bg-rose-100" },
    PAYOUT_PROCESSED: { icon: <Banknote className="w-4 h-4 text-cyan-600" />, bg: "bg-cyan-100" },
    PAYOUT_REJECTED: { icon: <Banknote className="w-4 h-4 text-rose-500" />, bg: "bg-rose-100" },
    DEPOSIT_APPROVED: { icon: <Banknote className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100" },
    DEPOSIT_REJECTED: { icon: <Banknote className="w-4 h-4 text-rose-500" />, bg: "bg-rose-100" },
    KYC_APPROVED: { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100" },
    KYC_REJECTED: { icon: <ShieldCheck className="w-4 h-4 text-rose-500" />, bg: "bg-rose-100" },
    MEMBERSHIP_ACTIVATED: { icon: <Star className="w-4 h-4 text-amber-500" />, bg: "bg-amber-100" },
    MEMBERSHIP_CANCELLED: { icon: <Star className="w-4 h-4 text-slate-400" />, bg: "bg-slate-100" },
    CERTIFICATION_EARNED: { icon: <Award className="w-4 h-4 text-violet-600" />, bg: "bg-violet-100" },
    CERTIFICATION_EXPIRING: { icon: <Clock className="w-4 h-4 text-amber-500" />, bg: "bg-amber-100" },
    LEVEL_UP: { icon: <TrendingUp className="w-4 h-4 text-cyan-600" />, bg: "bg-cyan-100" },
    FRAUD_FLAG: { icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, bg: "bg-rose-100" },
    DISPUTE_UPDATE: { icon: <MessageSquare className="w-4 h-4 text-violet-500" />, bg: "bg-violet-100" },
    SUPPORT_REPLY: { icon: <MessageSquare className="w-4 h-4 text-cyan-600" />, bg: "bg-cyan-100" },
    REFERRAL_BONUS:     { icon: <Gift className="w-4 h-4 text-emerald-600" />,    bg: "bg-emerald-100" },
    MILESTONE_BONUS:    { icon: <TrendingUp className="w-4 h-4 text-amber-600" />,  bg: "bg-amber-100"   },
    GTMS_PASS_ACTIVATED:{ icon: <Gem className="w-4 h-4 text-amber-600" />,          bg: "bg-amber-100"   },
    ACCOUNT_DORMANT:    { icon: <Lock className="w-4 h-4 text-rose-600" />,          bg: "bg-rose-100"    },
    ACCOUNT_REACTIVATED:{ icon: <CheckCheck className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100" },
    WELCOME_BONUS:      { icon: <Gift className="w-4 h-4 text-emerald-600" />,        bg: "bg-emerald-100" },
    COMBINATION_INTRO:  { icon: <Gem className="w-4 h-4 text-amber-600" />,           bg: "bg-amber-100"   },
  };

  const entry = map[type] ?? { icon: <Bell className="w-4 h-4 text-slate-500" />, bg: "bg-slate-100" };
  return (
    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${entry.bg}`}>
      {entry.icon}
    </span>
  );
}

export default async function AdminNotificationsPage() {
  const user = await requireAdmin();

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id, 50),
    getUnreadCount(user.id),
  ]);

  // Auto-mark all as read on page load
  await markAllRead(user.id);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="System alerts, flagged activity, and admin-level notifications"
        action={
          unreadCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 text-[12px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {unreadCount} unread
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 font-medium">
                <CheckCheck className="w-3.5 h-3.5" />
                Marked as read
              </span>
            </div>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <div className="py-6">
            <EmptyState
              title="No notifications yet"
              description="System alerts and admin notifications will appear here when they arrive."
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-slate-800">
                All Notifications
              </h2>
              <span className="text-[12px] text-slate-400">{notifications.length} total</span>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => {
              const isUnread = !n.readAt;
              const row = (
                <div
                  className={`flex items-start gap-3.5 px-5 py-4 transition-colors group ${
                    isUnread
                      ? "bg-cyan-50/30 border-l-[3px] border-l-cyan-400 hover:bg-cyan-50/50"
                      : "border-l-[3px] border-l-transparent hover:bg-slate-50/60"
                  }`}
                >
                  {/* Unread dot */}
                  <span className="flex-shrink-0 mt-[7px]">
                    <span
                      className={`block w-1.5 h-1.5 rounded-full ${
                        isUnread ? "bg-amber-400" : "bg-slate-200"
                      }`}
                    />
                  </span>

                  {/* Type icon */}
                  <NotificationIcon type={n.type} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13.5px] leading-snug truncate ${
                        isUnread ? "font-semibold text-slate-800" : "font-normal text-slate-700"
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-[12.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="flex-shrink-0 text-[11.5px] text-slate-400 mt-0.5 whitespace-nowrap">
                    {relativeTime(n.createdAt)}
                  </span>
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {row}
                </Link>
              ) : (
                <div key={n.id}>{row}</div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
