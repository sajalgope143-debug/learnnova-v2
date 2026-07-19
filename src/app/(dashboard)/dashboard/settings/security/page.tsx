import { createClient } from "@/lib/supabase/server";
import { PasswordChangeForm } from "@/components/dashboard/password-change-form";
import { PayoutMethodForm } from "@/components/dashboard/payout-method-form";

export default async function SecuritySettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: payoutMethods } = await supabase.from("payout_methods").select("*").eq("user_id", user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Security Settings</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Change Password
          </h2>
          <div className="mt-4">
            <PasswordChangeForm />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Payout Methods
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Add a bank account or UPI ID to receive referral withdrawals.
          </p>
          <div className="mt-4">
            <PayoutMethodForm existingMethods={payoutMethods ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
