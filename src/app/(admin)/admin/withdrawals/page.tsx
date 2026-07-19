import { createAdminClient } from "@/lib/supabase/admin";
import { AdminWithdrawalsTable } from "@/components/admin/admin-withdrawals-table";

export default async function AdminWithdrawalsPage() {
  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("withdrawal_requests")
    .select("*, user:profiles!withdrawal_requests_user_id_fkey(full_name), payout_method:payout_methods(*)")
    .order("requested_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Withdrawal Requests</h1>
      <div className="mt-6">
        <AdminWithdrawalsTable initialRequests={(requests ?? []) as any} />
      </div>
    </div>
  );
}
