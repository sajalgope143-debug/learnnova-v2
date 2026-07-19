"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingCart } from "lucide-react";

interface Props {
  courseId: string;
  isEnrolled: boolean;
  courseSlug: string;
  price: number;
  discountPrice: number | null;
}

/**
 * Kicks off the checkout flow. This component only *creates the order
 * record*; the actual Razorpay/Cashfree checkout modal + course unlock
 * happens on /checkout/[orderId] (see payment integration section).
 */
export function EnrollButton({ courseId, isEnrolled, courseSlug, price, discountPrice }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/learn/${courseSlug}`)}
        className="btn-primary w-full"
      >
        Continue Learning
      </button>
    );
  }

  const finalPrice = discountPrice != null && discountPrice < price ? discountPrice : price;

  async function handleEnroll() {
    if (finalPrice === 0) {
      // Free course — enroll directly without going through a payment gateway.
      setLoading(true);
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const json = await res.json();
      setLoading(false);
      if (!json.success) {
        toast.error(json.error ?? "Could not enroll. Please log in first.");
        return;
      }
      toast.success("Enrolled! Redirecting to your course...");
      router.push(`/learn/${courseSlug}`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error ?? "Could not start checkout. Please log in first.");
      return;
    }

    router.push(`/checkout/${json.data.orderId}`);
  }

  return (
    <button onClick={handleEnroll} disabled={loading} className="btn-primary w-full gap-2">
      {loading ? <Loader2 className="animate-spin" size={18} /> : <ShoppingCart size={18} />}
      {finalPrice === 0 ? "Enroll for Free" : `Enroll Now — ₹${finalPrice}`}
    </button>
  );
}
