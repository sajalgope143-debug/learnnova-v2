import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Award, Wallet, Flame, ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { count: enrollmentCount }, { count: certCount }, { data: wallet }, { data: enrollments }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("certificates").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("wallets").select("*").eq("user_id", user.id).single(),
      supabase
        .from("enrollments")
        .select("*, course:courses(*, category:categories(*))")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false })
        .limit(4),
    ]);

  const stats = [
    { label: "Enrolled Courses", value: enrollmentCount ?? 0, icon: BookOpen, color: "text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400" },
    { label: "Certificates Earned", value: certCount ?? 0, icon: Award, color: "text-accent-500 bg-accent-50 dark:bg-accent-900/30 dark:text-accent-400" },
    { label: "Wallet Balance", value: `₹${wallet?.balance ?? 0}`, icon: Wallet, color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Day Streak", value: profile?.streak_count ?? 0, icon: Flame, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Here&apos;s a snapshot of your learning journey.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </span>
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Continue where you left off
        </h2>
        <Link href="/dashboard/my-courses" className="flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-slate-400">
          You haven&apos;t enrolled in any courses yet.{" "}
          <Link href="/courses" className="font-medium text-brand-600 dark:text-brand-400">
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {enrollments.map((e: any) => (
            <div key={e.id}>
              <CourseCard course={e.course} />
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${e.progress_percent}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {e.progress_percent}% complete
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
