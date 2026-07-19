"use client";

import { useState } from "react";
import { toast } from "sonner";

interface WithdrawalRow {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  user?: { full_name: string | null };
  payout_method?: { method_type: string; upi_id: string | null; account_number: string | null };
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function AdminWithdrawalsTable({ initialRequests }: { initialRequests: WithdrawalRow[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAction(requestId: string, action: "approve" | "reject" | "mark_paid") {
    setProcessingId(requestId);
    const res = await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    const json = await res.json();
    setProcessingId(null);

    if (!json.success) {
      toast.error(json.error);
      return;
    }

    const newStatus = action === "approve" ? "approved" : action === "mark_paid" ? "paid" : "rejected";
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
    toast.success(`Withdrawal ${newStatus}`);
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payout Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No withdrawal requests.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {r.user?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">₹{r.amount}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {r.payout_method
                      ? r.payout_method.method_type === "upi"
                        ? `UPI: ${r.payout_method.upi_id}`
                        : `Bank: ${r.payout_method.account_number}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(r.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(r.id, "approve")}
                          disabled={processingId === r.id}
                          className="text-xs font-medium text-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "reject")}
                          disabled={processingId === r.id}
                          className="text-xs font-medium text-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() => handleAction(r.id, "mark_paid")}
                        disabled={processingId === r.id}
                        className="text-xs font-medium text-brand-600"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
