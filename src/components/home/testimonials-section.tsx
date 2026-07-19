import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ananya Roy",
    role: "Frontend Developer",
    quote:
      "The structured path from beginner to job-ready took me under four months. The projects were exactly what interviewers asked about.",
    rating: 5,
  },
  {
    name: "Rahul Sen",
    role: "Data Analyst",
    quote:
      "Clear explanations, practical assignments, and a supportive community. I finally understood statistics after struggling for years.",
    rating: 5,
  },
  {
    name: "Farhana Akter",
    role: "UI/UX Designer",
    quote:
      "Learning in Bengali made complex design concepts click so much faster. The Bengali course selection here is genuinely excellent.",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="container-app py-16">
      <h2 className="text-center font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
        What our students say
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="card p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < t.rating ? "fill-accent-400 text-accent-400" : "text-slate-300"}
                />
              ))}
            </div>
            <blockquote className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                {t.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
