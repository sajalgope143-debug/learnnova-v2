import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CheckoutClient } from "@/components/course/checkout-client";

export default async function CheckoutPage({ params }: { params: { orderId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, course:courses(title, thumbnail_url, slug)")
    .eq("id", params.orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  if (order.status === "paid") {
    redirect(`/learn/${order.course?.slug}`);
  }

  return <CheckoutClient order={order as any} userEmail={user.email ?? ""} />;
}
