import { Star } from "lucide-react";
import type { Review } from "@/types";

export function CourseReviews({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(averageRating) ? "fill-accent-400 text-accent-400" : "text-slate-300"}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{totalReviews} reviews</div>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {reviews.length === 0 && (
          <p className="text-sm text-slate-400">No reviews yet. Be the first to review this course!</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="border-t border-slate-200 pt-5 first:border-0 first:pt-0 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                {review.user?.full_name?.charAt(0) ?? "?"}
              </span>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {review.user?.full_name ?? "Anonymous"}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < review.rating ? "fill-accent-400 text-accent-400" : "text-slate-300"}
                    />
                  ))}
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
