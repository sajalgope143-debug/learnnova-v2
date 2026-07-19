import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for students and instructors on LearnSphere.",
};

const studentFeatures = [
  "Pay per course — no subscription required",
  "Lifetime access to purchased courses",
  "Certificates of completion",
  "Mobile and desktop access",
  "Referral earnings on every friend you invite",
];

const instructorFeatures = [
  "Keep 70% of every sale",
  "Free HD video hosting",
  "Built-in quiz and assignment tools",
  "Payouts every 24–48 hours",
  "Detailed student analytics",
];

export default function PricingPage() {
  return (
    <div className="container-app py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Simple, fair pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          No subscriptions, no hidden fees. Pay only for the courses you take —
          and earn back credit when you refer friends.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">For Students</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pay only for what you learn</p>
          <div className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            ₹299 <span className="text-base font-normal text-slate-400">avg. course price</span>
          </div>
          <ul className="mt-6 space-y-3">
            {studentFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Check size={16} className="mt-0.5 shrink-0 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/courses" className="btn-primary mt-6 w-full">
            Browse Courses
          </Link>
        </div>

        <div className="card border-2 border-brand-500 p-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">For Instructors</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teach and earn on your terms</p>
          <div className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            70% <span className="text-base font-normal text-slate-400">revenue share</span>
          </div>
          <ul className="mt-6 space-y-3">
            {instructorFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Check size={16} className="mt-0.5 shrink-0 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/signup?role=instructor" className="btn-primary mt-6 w-full">
            Start Teaching
          </Link>
        </div>
      </div>
    </div>
  );
}
