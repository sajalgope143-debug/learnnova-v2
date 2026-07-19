"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [language, setLanguage] = useState(profile?.language ?? "en");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, username, bio, language })
      .eq("id", profile?.id);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input className="input-field opacity-60" value={email} disabled />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Full name
        </label>
        <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Username
        </label>
        <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Bio
        </label>
        <textarea
          className="input-field min-h-[80px]"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Preferred language
        </label>
        <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value as "en" | "bn")}>
          <option value="en">English</option>
          <option value="bn">বাংলা (Bengali)</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Save changes"}
      </button>
    </form>
  );
}
