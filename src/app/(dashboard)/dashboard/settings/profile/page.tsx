import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfileSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Update your personal information.</p>

      <div className="card mt-6 max-w-lg p-6">
        <ProfileForm profile={profile} email={user.email ?? ""} />
      </div>
    </div>
  );
}
