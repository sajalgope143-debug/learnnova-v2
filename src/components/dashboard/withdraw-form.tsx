"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PayoutMethod {
  id: string;
  method_type: "bank" | "upi";
  upi_id: string | null;
  account_number: string | null;
}

export function WithdrawForm({
  balance,
  minPayout,
  payoutMethods,
}: {
  balance: number;
  minPayout: number;
  payoutMethods: PayoutMethod[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState(payoutMethods[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!methodId) {
      toast.error("Add a bank/UPI payout method first");
      return;
    }
    if (numAmount < minPayout) {
      toast.error(`Minimum withdrawal is ₹${minPayout}`);
      return;
    }
    if (numAmount > balance) {
      toast.error("Amount exceeds your wallet balance");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: numAmount, payoutMethodId: methodId }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success("Withdrawal request submitted for review");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Amount to withdraw
        </label>
        <input
          type="number"
          min={minPayout}
          max={balance}
          className="input-field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min ₹${minPayout}`}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Payout method
        </label>
        <select className="input-field" value={methodId} onChange={(e) => setMethodId(e.target.value)}>
          {payoutMethods.length === 0 && <option value="">No payout method added</option>}
          {payoutMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.method_type === "upi" ? `UPI — ${m.upi_id}` : `Bank — ${m.account_number}`}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Request Withdrawal"}
      </button>
    </form>
  );
}
