import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";

async function createCoupon(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("coupons").insert({
    code: (formData.get("code") as string).toUpperCase(),
    discount_type: formData.get("discountType") as string,
    discount_value: Number(formData.get("discountValue")),
    min_order_amount: Number(formData.get("minOrderAmount")) || 0,
    usage_limit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : null,
    valid_until: formData.get("validUntil") ? new Date(formData.get("validUntil") as string).toISOString() : null,
  });
  revalidatePath("/admin/coupons");
}

async function toggleCoupon(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";
  await admin.from("coupons").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/admin/coupons");
}

async function deleteCoupon(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  await admin.from("coupons").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/coupons");
}

export default async function AdminCouponsPage() {
  const admin = createAdminClient();
  const { data: coupons } = await admin.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Coupons</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {(coupons ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3">
                    {c.used_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCoupon}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="isActive" value={String(c.is_active)} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          c.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        }`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteCoupon}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-red-500" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">New Coupon</h2>
          <form action={createCoupon} className="mt-4 space-y-3">
            <input name="code" placeholder="CODE20" className="input-field uppercase" required />
            <select name="discountType" className="input-field">
              <option value="percent">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
            <input name="discountValue" type="number" placeholder="Discount value" className="input-field" required />
            <input name="minOrderAmount" type="number" placeholder="Min order amount (₹)" className="input-field" />
            <input name="usageLimit" type="number" placeholder="Usage limit (optional)" className="input-field" />
            <input name="validUntil" type="date" className="input-field" />
            <button type="submit" className="btn-primary w-full">Create Coupon</button>
          </form>
        </div>
      </div>
    </div>
  );
}
