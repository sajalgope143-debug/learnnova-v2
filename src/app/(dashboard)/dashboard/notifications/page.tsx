import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
      <div className="mt-6">
        <NotificationsList initialNotifications={notifications ?? []} />
      </div>
    </div>
  );
}
