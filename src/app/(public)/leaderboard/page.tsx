import { createClient } from "@/lib/supabase/server";
import { Flame, Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See who's leading the LearnSphere community in learning streaks and course completions.",
};

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-700"];

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: topLearners } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, streak_count")
    .order("streak_count", { ascending: false })
    .limit(20);

  return (
    <div className="container-app max-w-2xl py-16">
      <div className="text-center">
        <Trophy className="mx-auto text-accent-400" size={40} />
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Learning Streak Leaderboard
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Keep learning daily to climb the ranks and earn streak badges.
        </p>
      </div>

      <div className="card mt-8 divide-y divide-slate-200 dark:divide-slate-800">
        {(topLearners ?? []).map((learner, i) => (
          <div key={learner.id} className="flex items-center gap-4 p-4">
            <span className={`w-6 text-center font-display font-bold ${medalColors[i] ?? "text-slate-400"}`}>
              {i + 1}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {learner.full_name?.charAt(0) ?? "?"}
            </span>
            <span className="flex-1 font-medium text-slate-900 dark:text-white">
              {learner.full_name ?? "Anonymous Learner"}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-500">
              <Flame size={14} /> {learner.streak_count} days
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
