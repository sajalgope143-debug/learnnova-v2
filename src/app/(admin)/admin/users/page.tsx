import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: users } = await admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{users?.length ?? 0} users total</p>
      <div className="mt-6">
        <AdminUsersTable initialUsers={users ?? []} />
      </div>
    </div>
  );
}
