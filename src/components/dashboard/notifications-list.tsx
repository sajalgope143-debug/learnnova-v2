"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CreditCard, BookOpen, Users, Settings } from "lucide-react";
import Link from "next/link";
import type { Notification } from "@/types";

const iconFor: Record<Notification["type"], React.ComponentType<{ size?: number }>> = {
  info: Bell,
  payment: CreditCard,
  course: BookOpen,
  referral: Users,
  system: Settings,
};

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    }
  }

  if (notifications.length === 0) {
    return <div className="card p-10 text-center text-slate-400">You're all caught up — no notifications.</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-end border-b border-slate-200 p-3 dark:border-slate-800">
        <button onClick={markAllRead} className="text-xs font-medium text-brand-600 dark:text-brand-400">
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {notifications.map((n) => {
          const Icon = iconFor[n.type];
          const content = (
            <div
              className={`flex items-start gap-3 p-4 transition ${
                !n.is_read ? "bg-brand-50/50 dark:bg-brand-950/20" : ""
              }`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300">
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</div>
                {n.message && <div className="text-sm text-slate-500 dark:text-slate-400">{n.message}</div>}
                <div className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
