"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm the LearnSphere support assistant. Ask me about courses, payments, refunds, or your account." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/support/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please use the Contact page for help." }]);
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: json.data.reply }]);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition hover:bg-brand-600"
        aria-label="Open support chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-surface-dark-subtle">
          <div className="border-b border-slate-200 bg-brand-500 p-4 text-white dark:border-slate-800">
            <div className="font-display font-semibold">LearnSphere Support</div>
            <div className="text-xs text-brand-100">Usually replies instantly</div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1 text-slate-400">
                <Loader2 size={14} className="animate-spin" /> Typing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question..."
              className="input-field text-sm"
            />
            <button onClick={handleSend} disabled={loading} className="btn-primary p-2.5" aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
