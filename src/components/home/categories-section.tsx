import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Code2, BarChart3, Palette, Briefcase, Languages, BookOpen } from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, typeof Code2> = {
  code: Code2,
  "bar-chart": BarChart3,
  palette: Palette,
  briefcase: Briefcase,
  languages: Languages,
};

export async function CategoriesSection() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order")
    .limit(6);

  const list = (categories ?? []) as Category[];

  return (
    <section className="bg-surface-subtle py-16 dark:bg-surface-dark-subtle">
      <div className="container-app">
        <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Explore Categories
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {list.map((category) => {
            const Icon = iconMap[category.icon ?? ""] ?? BookOpen;
            return (
              <Link
                key={category.id}
                href={`/courses?category=${category.slug}`}
                className="card flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Icon size={22} />
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
