import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function updateStatus(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin
    .from("support_tickets")
    .update({ status: formData.get("status") as string, updated_at: new Date().toISOString() })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/tickets");
}

const statusColors: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800",
};

export default async function AdminTicketsPage() {
  const admin = createAdminClient();
  const { data: tickets } = await admin
    .from("support_tickets")
    .select("*, user:profiles!support_tickets_user_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>

      <div className="mt-6 card divide-y divide-slate-200 dark:divide-slate-800">
        {(tickets ?? []).length === 0 ? (
          <p className="p-10 text-center text-slate-400">No support tickets.</p>
        ) : (
          (tickets ?? []).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{t.subject}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.user?.full_name} • {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[t.status]}`}>
                  {t.status.replace("_", " ")}
                </span>
                <form action={updateStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <select
                    name="status"
                    defaultValue={t.status}
                    onChange={(e) => e.target.form?.requestSubmit()}
                    className="input-field w-auto py-1 text-xs"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
