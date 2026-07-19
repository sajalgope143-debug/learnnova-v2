import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course/course-card";
import type { Course, Category } from "@/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Explore hundreds of courses across web development, data science, design, business, and more.",
};

interface Props {
  searchParams: { q?: string; category?: string; level?: string; sort?: string };
}

export default async function CoursesPage({ searchParams }: Props) {
  const supabase = createClient();

  let query = supabase
    .from("courses")
    .select("*, category:categories(*), instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url)")
    .eq("status", "published");

  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);
  if (searchParams.level) query = query.eq("level", searchParams.level);
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const sort = searchParams.sort ?? "newest";
  if (sort === "price_low") query = query.order("price", { ascending: true });
  else if (sort === "price_high") query = query.order("price", { ascending: false });
  else if (sort === "rating") query = query.order("average_rating", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: courses } = await query.limit(24);
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  const list = (courses ?? []) as unknown as Course[];
  const cats = (categories ?? []) as Category[];

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `/courses${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
        {searchParams.q ? `Results for "${searchParams.q}"` : "Browse Courses"}
      </h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Category</h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={buildHref({ category: undefined })}
                  className={`block rounded-lg px-3 py-1.5 text-sm ${
                    !searchParams.category
                      ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  All Categories
                </Link>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug })}
                    className={`block rounded-lg px-3 py-1.5 text-sm ${
                      searchParams.category === c.slug
                        ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">Level</h3>
            <ul className="mt-3 space-y-1">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <li key={lvl}>
                  <Link
                    href={buildHref({ level: searchParams.level === lvl ? undefined : lvl })}
                    className={`block rounded-lg px-3 py-1.5 text-sm capitalize ${
                      searchParams.level === lvl
                        ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {lvl}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {list.length} course{list.length !== 1 ? "s" : ""} found
            </span>
            <select
              defaultValue={sort}
              className="input-field w-auto text-sm"
              onChange={(e) => {
                window.location.href = buildHref({ sort: e.target.value });
              }}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center text-slate-400 dark:border-slate-700">
              No courses match your filters. Try adjusting your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
