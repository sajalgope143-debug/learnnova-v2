import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Refund Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: January 2026</p>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>1. Eligibility Window</h2>
        <p>
          You may request a refund within 7 days of purchasing a course,
          provided you have completed less than 30% of the course content.
        </p>

        <h2>2. How to Request a Refund</h2>
        <p>
          Go to Dashboard → Payment History, find the relevant order, and
          submit a refund request, or contact our support team via the
          Contact page with your order invoice number.
        </p>

        <h2>3. Processing Time</h2>
        <p>
          Approved refunds are processed within 5–7 business days and
          credited back to your original payment method via Razorpay or
          Cashfree.
        </p>

        <h2>4. Non-Refundable Situations</h2>
        <ul>
          <li>Courses completed more than 30%</li>
          <li>Courses purchased more than 7 days ago</li>
          <li>Free courses or courses obtained via a 100%-discount coupon</li>
          <li>Certificates already issued for the course</li>
        </ul>

        <h2>5. Referral Commission Reversal</h2>
        <p>
          If an order is refunded, any referral commission that was
          credited to the referrer's wallet for that order will be
          reversed. If the balance has already been withdrawn, the
          reversal will be adjusted against future earnings.
        </p>

        <h2>6. Instructor Payouts</h2>
        <p>
          Refunds issued within the eligibility window will result in a
          corresponding deduction from the instructor's payable earnings
          for that sale.
        </p>

        <h2>7. Contact</h2>
        <p>
          For refund-related questions, reach us at billing@learnsphere.app.
        </p>
      </div>
    </div>
  );
}
