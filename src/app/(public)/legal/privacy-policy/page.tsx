import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: January 2026</p>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly, such as your name,
          email address, phone number, and payment details, as well as
          information generated through your use of the platform, such as
          course progress, quiz scores, and device/browser data.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use your information to provide and improve our services,
          process payments, issue certificates, communicate with you about
          your account or courses, and personalize your learning experience.
        </p>

        <h2>3. Payment Information</h2>
        <p>
          Payments are processed securely through Razorpay and Cashfree. We
          do not store your full card details on our servers — this is
          handled entirely by our PCI-DSS compliant payment partners.
        </p>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share data with service
          providers who help us operate the platform (e.g. hosting, email
          delivery, payment processing), each bound by confidentiality
          obligations.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use cookies to maintain your login session, remember your
          theme preference, and understand how the platform is used.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You may access, correct, or delete your personal data at any time
          from your Profile Settings, or by contacting our support team.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about this policy can be directed to
          privacy@learnsphere.app.
        </p>
      </div>
    </div>
  );
}
