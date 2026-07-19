import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const admin = createAdminClient();
  let query = admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { userId, role, isActive } = await request.json();
  if (!userId) return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (role) updates.role = role;
  if (typeof isActive === "boolean") updates.is_active = isActive;

  const { error } = await admin.from("profiles").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
