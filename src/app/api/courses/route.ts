import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/courses?q=&category=&level=&sort=
 * Public course listing with search, category filter, and sorting.
 * Only ever returns `status = 'published'` courses (enforced by RLS too).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 12;

  const supabase = createClient();
  let query = supabase
    .from("courses")
    .select(
      "*, category:categories(*), instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (q) query = query.ilike("title", `%${q}%`);
  if (level) query = query.eq("level", level);
  if (category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  switch (sort) {
    case "price_low":
      query = query.order("price", { ascending: true });
      break;
    case "price_high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: { courses: data, total: count, page, pageSize },
  });
}
