"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/courses?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient glow — part of the LearnSphere brand identity */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400/30 via-brand-300/10 to-accent-400/20 blur-3xl animate-glow-pulse" />
      </div>

      <div className="container-app py-20 text-center sm:py-28">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-up dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
          <Sparkles size={14} />
          Now available in English & Bengali
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-slate-900 animate-fade-up [animation-delay:100ms] sm:text-5xl lg:text-6xl dark:text-white">
          Learn skills that move your{" "}
          <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
            career forward
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 animate-fade-up [animation-delay:200ms] dark:text-slate-300">
          Premium video courses, hands-on projects, and certificates —
          taught by working professionals, at a price that respects your
          wallet.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card animate-fade-up [animation-delay:300ms] dark:border-slate-800 dark:bg-surface-dark-subtle"
        >
          <Search className="ml-2 text-slate-400" size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="What do you want to learn today?"
            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 animate-fade-up [animation-delay:400ms] dark:text-slate-400">
          <span>Popular:</span>
          {["Web Development", "Data Science", "UI/UX Design", "Digital Marketing"].map((tag) => (
            <button
              key={tag}
              onClick={() => router.push(`/courses?q=${encodeURIComponent(tag)}`)}
              className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
