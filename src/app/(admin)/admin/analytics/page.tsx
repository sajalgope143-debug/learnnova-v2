import { createAdminClient } from "@/lib/supabase/admin";
import { AdminRevenueChart } from "@/components/admin/revenue-chart";
import { Star } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  const [{ data: paidOrders }, { data: courses }, { count: totalReferrals }] = await Promise.all([
    admin.from("orders").select("final_amount, created_at").eq("status", "paid"),
    admin.from("courses").select("id, title, total_students, average_rating, total_reviews").order("total_students", { ascending: false }),
    admin.from("referral_earnings").select("id", { count: "exact", head: true }),
  ]);

  const monthlyRevenue: Record<string, number> = {};
  (paidOrders ?? []).forEach((o) => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + Number(o.final_amount);
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>

      <div className="mt-6 card p-5">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Sales Over Time</h2>
        <AdminRevenueChart data={monthlyRevenue} />
      </div>

      <div className="mt-6 card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Course Performance</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{totalReferrals ?? 0} referral conversions</span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2">Course</th>
                <th className="py-2">Students</th>
                <th className="py-2">Rating</th>
                <th className="py-2">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {(courses ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-medium text-slate-900 dark:text-white">{c.title}</td>
                  <td className="py-2">{c.total_students}</td>
                  <td className="py-2 flex items-center gap-1">
                    <Star size={13} className="fill-accent-400 text-accent-400" /> {c.average_rating.toFixed(1)}
                  </td>
                  <td className="py-2">{c.total_reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
