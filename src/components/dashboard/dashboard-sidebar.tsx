"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Award,
  Wallet,
  Users,
  Receipt,
  Bell,
  UserCog,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/continue-learning", label: "Continue Learning", icon: PlayCircle },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/payments", label: "Payment History", icon: Receipt },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings/profile", label: "Profile Settings", icon: UserCog },
  { href: "/dashboard/settings/security", label: "Security", icon: ShieldCheck },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-surface-dark">
      <nav className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto p-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut size={18} />
          Log out
        </button>
      </nav>
    </aside>
  );
}
