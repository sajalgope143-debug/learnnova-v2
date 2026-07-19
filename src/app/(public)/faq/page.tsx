import type { Metadata } from "next";
import { FaqAccordion } from "@/components/home/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about courses, payments, refunds, and certificates on LearnSphere.",
};

const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Browse our course catalog, click on a course you're interested in, and hit 'Enroll Now'. You'll be guided through a secure checkout with Razorpay or Cashfree. Once payment is confirmed, the course unlocks instantly in your dashboard.",
  },
  {
    question: "Do courses expire?",
    answer:
      "No. Once you purchase a course, you have lifetime access to it, including any future updates the instructor makes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support all major payment methods through Razorpay and Cashfree, including credit/debit cards, UPI, net banking, and popular wallets.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, most courses are eligible for a refund within 7 days of purchase if you're not satisfied, provided you haven't completed more than 30% of the course. See our Refund Policy for full details.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Every account gets a unique referral link. When someone signs up using your link and purchases a course, you earn a commission (shown in your Referral Dashboard) that's added to your wallet. You can withdraw your wallet balance once it crosses the minimum payout threshold.",
  },
  {
    question: "Are certificates recognized by employers?",
    answer:
      "Our certificates verify that you've completed a specific curriculum and passed any associated assessments. While not a formal degree, many students have used them to demonstrate practical skills to employers and clients.",
  },
  {
    question: "Is LearnSphere available in Bengali?",
    answer:
      "Yes! We offer a growing catalog of courses taught entirely in Bengali, and our platform interface itself supports both English and Bengali.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-app max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
        Frequently Asked Questions
      </h1>
      <div className="mt-8">
        <FaqAccordion items={faqs} />
      </div>
    </div>
  );
}
