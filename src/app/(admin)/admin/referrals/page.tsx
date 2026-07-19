import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function updateRule(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("referral_rules").update({ is_active: false }).eq("is_active", true);
  await admin.from("referral_rules").insert({
    commission_type: formData.get("commissionType") as string,
    commission_value: Number(formData.get("commissionValue")),
    min_payout_amount: Number(formData.get("minPayoutAmount")),
    is_active: true,
  });
  revalidatePath("/admin/referrals");
}

export default async function AdminReferralsPage() {
  const admin = createAdminClient();
  const [{ data: rule }, { data: topReferrers }, { data: totalPayouts }] = await Promise.all([
    admin.from("referral_rules").select("*").eq("is_active", true).limit(1).maybeSingle(),
    admin
      .from("referral_earnings")
      .select("referrer_id, commission_amount, referrer:profiles!referral_earnings_referrer_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(200),
    admin.from("referral_earnings").select("commission_amount"),
  ]);

  // Aggregate top referrers in-memory (fine at this scale)
  const totals = new Map<string, { name: string; total: number }>();
  (topReferrers ?? []).forEach((r: any) => {
    const existing = totals.get(r.referrer_id) ?? { name: r.referrer?.full_name ?? "—", total: 0 };
    existing.total += Number(r.commission_amount);
    totals.set(r.referrer_id, existing);
  });
  const sortedReferrers = Array.from(totals.values()).sort((a, b) => b.total - a.total).slice(0, 10);

  const grandTotal = (totalPayouts ?? []).reduce((sum, r) => sum + Number(r.commission_amount), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Referral Program</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Top Referrers</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total paid out: ₹{grandTotal}</p>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {sortedReferrers.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No referral activity yet.</p>
            ) : (
              sortedReferrers.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{r.name}</span>
                  <span className="font-semibold text-green-600">₹{r.total.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Commission Rules</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current: {rule?.commission_value ?? 10}{rule?.commission_type === "percent" ? "%" : "₹"} per sale
          </p>
          <form action={updateRule} className="mt-4 space-y-3">
            <select name="commissionType" defaultValue={rule?.commission_type ?? "percent"} className="input-field">
              <option value="percent">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
            <input
              name="commissionValue"
              type="number"
              step="0.01"
              defaultValue={rule?.commission_value ?? 10}
              className="input-field"
              required
            />
            <input
              name="minPayoutAmount"
              type="number"
              placeholder="Min payout amount"
              defaultValue={rule?.min_payout_amount ?? 500}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary w-full">
              Update Rule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
