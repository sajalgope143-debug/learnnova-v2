import { createClient } from "@/lib/supabase/server";
import { ReferralLinkBox } from "@/components/dashboard/referral-link-box";
import { Users, IndianRupee, Percent } from "lucide-react";

export default async function ReferralsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: earnings }, { data: referredUsers }, { data: rule }] = await Promise.all([
    supabase.from("profiles").select("referral_code").eq("id", user.id).single(),
    supabase
      .from("referral_earnings")
      .select("*, referred_user:profiles!referral_earnings_referred_user_id_fkey(full_name)")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, created_at").eq("referred_by", user.id),
    supabase.from("referral_rules").select("*").eq("is_active", true).limit(1).maybeSingle(),
  ]);

  const totalEarned = (earnings ?? []).reduce((sum, e) => sum + Number(e.commission_amount), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Referral Program</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Invite friends and earn commission on every course they purchase.
      </p>

      <div className="mt-6 card p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your referral link</h2>
        <div className="mt-2">
          <ReferralLinkBox referralCode={profile?.referral_code ?? ""} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="card p-5">
          <Users className="text-brand-600 dark:text-brand-400" size={20} />
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{referredUsers?.length ?? 0}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Friends referred</div>
        </div>
        <div className="card p-5">
          <IndianRupee className="text-green-600 dark:text-green-400" size={20} />
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">₹{totalEarned}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total earned</div>
        </div>
        <div className="card p-5">
          <Percent className="text-accent-500" size={20} />
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {rule?.commission_value ?? 10}{rule?.commission_type === "percent" ? "%" : "₹"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Commission rate</div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Referral History</h2>
        <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
          {!earnings || earnings.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No referral earnings yet. Share your link to start earning!
            </p>
          ) : (
            earnings.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {e.referred_user?.full_name ?? "A referred student"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(e.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="font-semibold text-green-600">+₹{e.commission_amount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
