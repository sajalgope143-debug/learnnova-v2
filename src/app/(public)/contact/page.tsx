"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
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
      toast.error("Please log in to submit a support ticket");
      return;
    }

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      message,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message sent! Our support team will get back to you soon.");
    setSubject("");
    setMessage("");
  }

  return (
    <div className="container-app max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Have a question about a course, payment, or your account? We&apos;re here to help.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-3 p-4">
          <Mail className="text-brand-600 dark:text-brand-400" size={20} />
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Email</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">support@learnsphere.app</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <MessageSquare className="text-brand-600 dark:text-brand-400" size={20} />
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">Live Chat</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Mon–Sat, 10am–7pm IST</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
          <input className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
          <textarea
            className="input-field min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Message"}
        </button>
      </form>
    </div>
  );
}
