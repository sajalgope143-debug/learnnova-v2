import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: January 2026</p>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using LearnSphere, you agree to be
          bound by these Terms & Conditions and our Privacy Policy.
        </p>

        <h2>2. Account Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account.
        </p>

        <h2>3. Course Access & Licensing</h2>
        <p>
          When you purchase a course, you are granted a personal,
          non-transferable license to access the course content. You may
          not redistribute, resell, download for redistribution, or share
          your account access with others.
        </p>

        <h2>4. Instructor Content</h2>
        <p>
          Instructors retain ownership of the content they upload but grant
          LearnSphere a license to host, stream, and promote that content
          on the platform.
        </p>

        <h2>5. Payments & Referrals</h2>
        <p>
          All prices are listed in Indian Rupees (₹) unless otherwise
          stated. Referral commissions are calculated per our published
          Commission Rules and are subject to change with notice. Fraudulent
          referral activity (e.g. self-referral, fake accounts) will result
          in forfeiture of earnings and account suspension.
        </p>

        <h2>6. Prohibited Conduct</h2>
        <p>
          You may not use the platform to upload unlawful content, infringe
          on intellectual property, harass other users, or attempt to gain
          unauthorized access to any part of the system.
        </p>

        <h2>7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate accounts that
          violate these terms, at our discretion.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          LearnSphere is provided "as is." We are not liable for indirect,
          incidental, or consequential damages arising from your use of the
          platform.
        </p>

        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          platform after changes constitutes acceptance of the revised
          terms.
        </p>
      </div>
    </div>
  );
}
