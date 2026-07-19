import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <span className="font-display text-7xl font-bold text-brand-500">404</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
