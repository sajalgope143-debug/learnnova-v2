"use client";

import { useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import type { Order } from "@/types";

interface Props {
  order: Order & { course?: { title: string; thumbnail_url: string | null; slug: string } };
  userEmail: string;
}

export function CheckoutClient({ order, userEmail }: Props) {
  const router = useRouter();
  const [gateway, setGateway] = useState<"razorpay" | "cashfree">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount: number; final: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paying, setPaying] = useState(false);

  const displayAmount = couponApplied ? couponApplied.final : order.final_amount;

  async function handleApplyCoupon() {
    if (!couponCode) return;
    setApplyingCoupon(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, courseId: order.course_id }),
    });
    const json = await res.json();
    setApplyingCoupon(false);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    setCouponApplied({ discount: json.data.discountAmount, final: json.data.finalAmount });
    toast.success(`Coupon applied! You saved ₹${json.data.discountAmount}`);
  }

  async function handlePayWithRazorpay() {
    setPaying(true);
    const res = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: order.course_id, couponCode: couponCode || undefined }),
    });
    const json = await res.json();
    setPaying(false);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    if (json.data.free) {
      toast.success("Enrolled successfully!");
      router.push(`/learn/${order.course?.slug}`);
      return;
    }

    // @ts-expect-error — Razorpay is loaded globally via the checkout.js script
    const rzp = new window.Razorpay({
      key: json.data.keyId,
      amount: json.data.amount,
      currency: json.data.currency,
      order_id: json.data.razorpayOrderId,
      name: "LearnSphere",
      description: order.course?.title,
      prefill: { email: userEmail },
      theme: { color: "#6d5efc" },
      handler: function () {
        toast.success("Payment successful! Unlocking your course...");
        // The webhook fulfills the order asynchronously; poll briefly
        // then redirect — in production consider a small polling loop
        // against GET /api/courses/[slug] to confirm isEnrolled=true.
        setTimeout(() => router.push(`/learn/${order.course?.slug}`), 2500);
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled");
        },
      },
    });
    rzp.open();
  }

  async function handlePayWithCashfree() {
    setPaying(true);
    const res = await fetch("/api/payments/cashfree/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: order.course_id, couponCode: couponCode || undefined }),
    });
    const json = await res.json();
    setPaying(false);

    if (!json.success) {
      toast.error(json.error);
      return;
    }
    if (json.data.free) {
      toast.success("Enrolled successfully!");
      router.push(`/learn/${order.course?.slug}`);
      return;
    }

    // @ts-expect-error — Cashfree SDK loaded globally via script tag
    const cashfree = window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox" });
    cashfree.checkout({
      paymentSessionId: json.data.paymentSessionId,
      redirectTarget: "_self",
    });
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />

      <div className="container-app max-w-lg py-12">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Complete your purchase
        </h1>

        <div className="card mt-6 p-5">
          <div className="flex items-center gap-4">
            {order.course?.thumbnail_url && (
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image src={order.course.thumbnail_url} alt="" fill className="object-cover" />
              </div>
            )}
            <div>
              <div className="font-medium text-slate-900 dark:text-white">{order.course?.title}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Lifetime access</div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input-field pl-9"
              />
            </div>
            <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="btn-secondary">
              {applyingCoupon ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
            </button>
          </div>

          <div className="mt-5 space-y-1 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Price</span>
              <span>₹{order.base_amount}</span>
            </div>
            {(couponApplied?.discount ?? order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{couponApplied?.discount ?? order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-white">
              <span>Total</span>
              <span>₹{displayAmount}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setGateway("razorpay")}
              className={`rounded-xl border p-3 text-sm font-medium transition ${
                gateway === "razorpay"
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              Razorpay
            </button>
            <button
              onClick={() => setGateway("cashfree")}
              className={`rounded-xl border p-3 text-sm font-medium transition ${
                gateway === "cashfree"
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              Cashfree
            </button>
          </div>

          <button
            onClick={gateway === "razorpay" ? handlePayWithRazorpay : handlePayWithCashfree}
            disabled={paying}
            className="btn-primary w-full"
          >
            {paying ? <Loader2 className="animate-spin" size={18} /> : `Pay ₹${displayAmount}`}
          </button>
        </div>
      </div>
    </>
  );
}
