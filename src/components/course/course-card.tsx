import Image from "next/image";
import Link from "next/link";
import { Star, Users, Clock } from "lucide-react";
import type { Course } from "@/types";

export function CourseCard({ course }: { course: Course }) {
  const hasDiscount = course.discount_price != null && course.discount_price < course.price;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No preview</div>
        )}
        {course.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-400 px-2.5 py-1 text-xs font-semibold text-accent-900">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {course.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {course.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-slate-900 dark:text-white">
          {course.title}
        </h3>
        {course.instructor?.full_name && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            by {course.instructor.full_name}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Star size={13} className="fill-accent-400 text-accent-400" />
            {course.average_rating.toFixed(1)} ({course.total_reviews})
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {course.total_students}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {Math.round(course.duration_minutes / 60)}h
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{hasDiscount ? course.discount_price : course.price}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">₹{course.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
