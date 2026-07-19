import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        <MailCheck size={26} />
      </div>
      <h1 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
        Verify your email
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        We&apos;ve sent a confirmation link to your email address. Click the
        link to activate your account, then log in.
      </p>
      <Link href="/login" className="btn-primary mt-6 inline-flex">
        Go to login
      </Link>
    </div>
  );
}
