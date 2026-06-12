"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export function NotificationBell({ href = "/dashboard/notifications" }: { href?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="/dashboard/notifications"
      className="relative flex items-center justify-center w-full h-full text-slate-500 hover:text-slate-700 transition-colors"
      title="Notifications"
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
          {count > 99 ? "99" : count}
        </span>
      )}
    </a>
  );
}
