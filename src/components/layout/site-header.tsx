"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800/80 dark:bg-surface-dark/80">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 text-white">
            <GraduationCap size={18} />
          </span>
          LearnSphere
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 max-w-xs md:block lg:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              placeholder="Search courses..."
              className="input-field pl-9"
              aria-label="Search courses"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary hidden sm:inline-flex">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary hidden sm:inline-flex">
            Get started
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="search" placeholder="Search courses..." className="input-field pl-9" />
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-2">
            <Link href="/login" className="btn-secondary flex-1">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary flex-1">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
