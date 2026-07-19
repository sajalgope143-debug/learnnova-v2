import { createAdminClient } from "@/lib/supabase/admin";
import { Users, IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import { AdminRevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [{ count: totalUsers }, { count: activeUsers }, { data: paidOrders }, { data: topCourses }] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
      admin.from("orders").select("final_amount, created_at").eq("status", "paid"),
      admin.from("courses").select("id, title, total_students, average_rating").order("total_students", { ascending: false }).limit(5),
    ]);

  const totalRevenue = (paidOrders ?? []).reduce((sum, o) => sum + Number(o.final_amount), 0);

  const monthlyRevenue: Record<string, number> = {};
  (paidOrders ?? []).forEach((o) => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short" });
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + Number(o.final_amount);
  });

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400" },
    { label: "Active Users", value: activeUsers ?? 0, icon: TrendingUp, color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-accent-500 bg-accent-50 dark:bg-accent-900/30 dark:text-accent-400" },
    { label: "Total Orders", value: paidOrders?.length ?? 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon size={20} />
            </span>
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h2>
          <AdminRevenueChart data={monthlyRevenue} />
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Top Courses</h2>
          <div className="mt-3 space-y-3">
            {(topCourses ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1 text-slate-700 dark:text-slate-300">{c.title}</span>
                <span className="shrink-0 text-slate-500 dark:text-slate-400">{c.total_students} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
