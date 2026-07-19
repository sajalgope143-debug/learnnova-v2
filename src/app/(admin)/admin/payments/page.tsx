import { createAdminClient } from "@/lib/supabase/admin";

const statusColors: Record<string, string> = {
  paid: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  created: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-slate-100 text-slate-500 dark:bg-slate-800",
};

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*, user:profiles!orders_user_id_fkey(full_name), course:courses(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>

      <div className="mt-6 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {(orders ?? []).map((o: any) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs">{o.invoice_number}</td>
                  <td className="px-4 py-3">{o.user?.full_name ?? "—"}</td>
                  <td className="px-4 py-3">{o.course?.title}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹{o.final_amount}</td>
                  <td className="px-4 py-3 capitalize">{o.gateway}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
