import { createClient } from "@/lib/supabase/server";
import { Download, CheckCircle2, XCircle, Clock } from "lucide-react";

const statusConfig = {
  paid: { icon: CheckCircle2, className: "text-green-600 bg-green-50 dark:bg-green-900/30" },
  created: { icon: Clock, className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
  failed: { icon: XCircle, className: "text-red-600 bg-red-50 dark:bg-red-900/30" },
  refunded: { icon: XCircle, className: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
};

export default async function PaymentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("*, course:courses(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Payment History</h1>

      <div className="mt-6 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No payment history yet.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const config = statusConfig[order.status as keyof typeof statusConfig];
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {order.course?.title}
                      </td>
                      <td className="px-4 py-3">₹{order.final_amount}</td>
                      <td className="px-4 py-3 capitalize">{order.gateway}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize ${config.className}`}>
                          <config.icon size={12} /> {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {order.invoice_url ? (
                          <a href={order.invoice_url} className="flex items-center gap-1 text-brand-600 dark:text-brand-400" download>
                            <Download size={14} /> PDF
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
