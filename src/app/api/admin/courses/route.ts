import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

async function requireAdminOrInstructor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "instructor"].includes(profile.role)) return null;
  return { user, role: profile.role };
}

const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric with hyphens"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  language: z.string().default("en"),
  thumbnailUrl: z.string().url().optional(),
});

export async function GET() {
  const auth = await requireAdminOrInstructor();
  if (!auth) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  let query = admin
    .from("courses")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  // Instructors only see their own courses; admins see everything.
  if (auth.role === "instructor") {
    query = query.eq("instructor_id", auth.user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const auth = await requireAdminOrInstructor();
  if (!auth) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("courses")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      instructor_id: auth.user.id,
      price: parsed.data.price,
      discount_price: parsed.data.discountPrice,
      level: parsed.data.level,
      language: parsed.data.language,
      thumbnail_url: parsed.data.thumbnailUrl,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminOrInstructor();
  if (!auth) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { courseId, status } = await request.json();
  if (!courseId || !status) {
    return NextResponse.json({ success: false, error: "courseId and status are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Instructors may only modify their own courses.
  if (auth.role === "instructor") {
    const { data: course } = await admin.from("courses").select("instructor_id").eq("id", courseId).single();
    if (course?.instructor_id !== auth.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  }

  const { error } = await admin.from("courses").update({ status }).eq("id", courseId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
