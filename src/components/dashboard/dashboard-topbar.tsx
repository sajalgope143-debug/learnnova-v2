"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, X, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardTopbar({ unreadCount = 0 }: { unreadCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-6 dark:border-slate-800 dark:bg-surface-dark/90">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 text-white">
            <GraduationCap size={18} />
          </span>
          <span className="hidden sm:inline">LearnSphere</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Link>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="h-full w-72 bg-white dark:bg-surface-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <span className="font-display font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <DashboardSidebar />
          </div>
        </div>
      )}
    </header>
  );
}
