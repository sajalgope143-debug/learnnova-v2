import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-surface-dark">
        <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 text-white">
            <ShieldCheck size={18} />
          </span>
          LearnSphere Admin
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
