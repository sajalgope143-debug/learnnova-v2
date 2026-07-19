import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4 py-12 dark:bg-surface-dark">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 text-white">
            <GraduationCap size={20} />
          </span>
          LearnSphere
        </Link>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
