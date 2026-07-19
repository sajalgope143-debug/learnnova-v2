import { createClient } from "@/lib/supabase/server";
import { WithdrawForm } from "@/components/dashboard/withdraw-form";
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";

export default async function WalletPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: wallet }, { data: transactions }, { data: payoutMethods }, { data: rule }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user.id).single(),
    supabase
      .from("wallet_transactions")
      .select("*, wallet:wallets!inner(user_id)")
      .eq("wallet.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("payout_methods").select("*").eq("user_id", user.id),
    supabase.from("referral_rules").select("min_payout_amount").eq("is_active", true).limit(1).maybeSingle(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <WalletIcon className="text-brand-600 dark:text-brand-400" size={20} />
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                ₹{wallet?.balance ?? 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Balance</div>
            </div>
            <div className="card p-5">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                ₹{wallet?.total_earned ?? 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total earned</div>
            </div>
            <div className="card p-5">
              <TrendingDown className="text-slate-500" size={20} />
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                ₹{wallet?.total_withdrawn ?? 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Withdrawn</div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Earnings History
            </h2>
            <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
              {!transactions || transactions.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No transactions yet.</p>
              ) : (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {tx.description ?? tx.type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={tx.amount > 0 ? "font-semibold text-green-600" : "font-semibold text-red-500"}>
                      {tx.amount > 0 ? "+" : ""}₹{tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Withdraw Funds
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Minimum withdrawal: ₹{rule?.min_payout_amount ?? 500}
          </p>
          <div className="mt-4">
            <WithdrawForm
              balance={wallet?.balance ?? 0}
              minPayout={rule?.min_payout_amount ?? 500}
              payoutMethods={payoutMethods ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
