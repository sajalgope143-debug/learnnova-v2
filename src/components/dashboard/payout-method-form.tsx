"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface PayoutMethod {
  id: string;
  method_type: "bank" | "upi";
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
}

export function PayoutMethodForm({ existingMethods }: { existingMethods: PayoutMethod[] }) {
  const router = useRouter();
  const [methodType, setMethodType] = useState<"bank" | "upi">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      toast.error("Please log in");
      return;
    }

    const { error } = await supabase.from("payout_methods").insert({
      user_id: user.id,
      method_type: methodType,
      upi_id: methodType === "upi" ? upiId : null,
      account_holder_name: methodType === "bank" ? accountHolder : null,
      account_number: methodType === "bank" ? accountNumber : null,
      ifsc_code: methodType === "bank" ? ifsc : null,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Payout method added");
    setUpiId("");
    setAccountHolder("");
    setAccountNumber("");
    setIfsc("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("payout_methods").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {existingMethods.length > 0 && (
        <div className="space-y-2">
          {existingMethods.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
              <span>{m.method_type === "upi" ? `UPI: ${m.upi_id}` : `Bank: ${m.account_number}`}</span>
              <button onClick={() => handleDelete(m.id)} className="text-red-500" aria-label="Remove">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMethodType("upi")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${methodType === "upi" ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "border-slate-200 dark:border-slate-700"}`}
          >
            UPI
          </button>
          <button
            type="button"
            onClick={() => setMethodType("bank")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${methodType === "bank" ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "border-slate-200 dark:border-slate-700"}`}
          >
            Bank Account
          </button>
        </div>

        {methodType === "upi" ? (
          <input
            placeholder="yourname@upi"
            className="input-field"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        ) : (
          <>
            <input
              placeholder="Account holder name"
              className="input-field"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
            <input
              placeholder="Account number"
              className="input-field"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <input
              placeholder="IFSC code"
              className="input-field"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
            />
          </>
        )}

        <button type="submit" disabled={loading} className="btn-secondary w-full">
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Add payout method"}
        </button>
      </form>
    </div>
  );
}
