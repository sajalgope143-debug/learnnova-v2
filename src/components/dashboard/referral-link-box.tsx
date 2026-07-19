"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ReferralLinkBox({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${referralCode}` : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <code className="flex-1 truncate text-sm text-slate-600 dark:text-slate-300">{link}</code>
      <button onClick={handleCopy} className="btn-secondary shrink-0 gap-1.5 px-3 py-1.5 text-xs">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
