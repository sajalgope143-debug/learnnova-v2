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
  if (profile?.role !== "admin" && profile?.role !== "support") return null;
  return user;
}

/**
 * GET /api/admin/analytics
 * Aggregate stats for the admin dashboard: users, revenue, sales
 * trend, referral stats, and top-performing courses.
 * Uses the admin (service-role) client since these are cross-user
 * aggregates that no single RLS policy could safely expose.
 */
export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: paidOrders },
    { data: topCourses },
    { data: referralStats },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("orders").select("final_amount, created_at").eq("status", "paid"),
    admin
      .from("courses")
      .select("id, title, total_students, average_rating")
      .order("total_students", { ascending: false })
      .limit(5),
    admin.from("referral_earnings").select("commission_amount, created_at"),
  ]);

  const totalRevenue = (paidOrders ?? []).reduce((sum, o) => sum + Number(o.final_amount), 0);
  const totalReferralPayouts = (referralStats ?? []).reduce((sum, r) => sum + Number(r.commission_amount), 0);

  // Group revenue by month for the last 6 months (simple in-memory bucketing —
  // fine at this scale; move to a SQL materialized view if orders grow large).
  const monthlyRevenue: Record<string, number> = {};
  (paidOrders ?? []).forEach((o) => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + Number(o.final_amount);
  });

  return NextResponse.json({
    success: true,
    data: {
      totalUsers: totalUsers ?? 0,
      activeUsers: activeUsers ?? 0,
      totalRevenue,
      totalOrders: paidOrders?.length ?? 0,
      totalReferralPayouts,
      monthlyRevenue,
      topCourses: topCourses ?? [],
    },
  });
}
