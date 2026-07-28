"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
    } catch {
      // endpoint may not exist yet; fail quietly
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [userId]);

  const unread = items.filter((n) => !n.readAt).length;

  async function markAll() {
    await fetch("/api/notifications", { method: "POST" }).catch(() => {});
    load();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
            <span className="text-sm font-semibold text-slate-700">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-brand-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                No notifications
              </p>
            ) : (
              items.map((n) => (
                <a
                  key={n.id}
                  href={n.link ?? "#"}
                  className={`block border-b border-slate-50 px-4 py-3 text-sm hover:bg-slate-50 ${
                    n.readAt ? "text-slate-500" : "font-medium text-slate-800"
                  }`}
                >
                  {n.title}
                  {n.body && <p className="mt-0.5 text-xs text-slate-400">{n.body}</p>}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
