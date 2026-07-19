import Link from "next/link";

export function InstructorSection() {
  return (
    <section id="instructors" className="container-app py-16">
      <div className="card grid grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-12">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-accent-500">
            For Instructors
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Teach what you know. Earn on your terms.
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Upload your course once, reach thousands of learners, and get
            paid automatically every time someone enrolls. Full analytics,
            student messaging, and payout tools included.
          </p>
          <Link href="/signup?role=instructor" className="btn-primary mt-6 inline-flex">
            Start teaching today
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["70%", "Instructor revenue share"],
            ["24-48h", "Payout processing"],
            ["HD", "Video hosting included"],
            ["Free", "Course creation tools"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-brand-50 p-4 dark:bg-brand-950">
              <div className="font-display text-xl font-bold text-brand-700 dark:text-brand-300">
                {value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="container-app pb-20 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-600/40 to-transparent" />
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-300">
          Join thousands of students building real skills today. No credit
          card required to browse.
        </p>
        <Link href="/signup" className="btn-primary mt-6 inline-flex bg-white text-slate-900 hover:bg-slate-100">
          Create your free account
        </Link>
      </div>
    </section>
  );
}
