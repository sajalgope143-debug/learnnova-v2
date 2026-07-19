import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Users, Clock, BarChart3, Globe } from "lucide-react";
import { EnrollButton } from "@/components/course/enroll-button";
import { CourseCurriculum } from "@/components/course/course-curriculum";
import { CourseReviews } from "@/components/course/course-reviews";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getCourseData(slug: string) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `*, category:categories(*),
       instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio),
       chapters(*, lessons(*))`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) return null;

  const sortedChapters = (course.chapters ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    }));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name, avatar_url)")
    .eq("course_id", course.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return { course: { ...course, chapters: sortedChapters }, isEnrolled, reviews: reviews ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getCourseData(params.slug);
  if (!result) return {};
  return {
    title: result.course.seo_title ?? result.course.title,
    description: result.course.seo_description ?? result.course.subtitle ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const result = await getCourseData(params.slug);
  if (!result) notFound();

  const { course, isEnrolled, reviews } = result;
  const hasDiscount = course.discount_price != null && course.discount_price < course.price;

  return (
    <div>
      {/* Header banner */}
      <div className="bg-slate-900 text-white">
        <div className="container-app grid grid-cols-1 gap-8 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {course.category && (
              <span className="text-sm font-medium text-brand-300">{course.category.name}</span>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{course.title}</h1>
            {course.subtitle && <p className="mt-3 text-slate-300">{course.subtitle}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-accent-400 text-accent-400" />
                {course.average_rating.toFixed(1)} ({course.total_reviews} ratings)
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {course.total_students} students
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {Math.round(course.duration_minutes / 60)}h total
              </span>
              {course.level && (
                <span className="flex items-center gap-1 capitalize">
                  <BarChart3 size={14} /> {course.level}
                </span>
              )}
              <span className="flex items-center gap-1 uppercase">
                <Globe size={14} /> {course.language}
              </span>
            </div>

            {course.instructor && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                Created by <span className="font-semibold text-white">{course.instructor.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-app -mt-8 grid grid-cols-1 gap-8 pb-16 lg:grid-cols-3">
        {/* Sidebar checkout card */}
        <aside className="order-first lg:order-last">
          <div className="card sticky top-24 overflow-hidden">
            <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
              {course.thumbnail_url && (
                <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{hasDiscount ? course.discount_price : course.price}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">₹{course.price}</span>
                )}
              </div>

              <div className="mt-4">
                <EnrollButton
                  courseId={course.id}
                  isEnrolled={isEnrolled}
                  courseSlug={course.slug}
                  price={course.price}
                  discountPrice={course.discount_price}
                />
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>✓ Full lifetime access</li>
                <li>✓ Certificate of completion</li>
                <li>✓ Downloadable resources</li>
                <li>✓ Access on mobile and desktop</li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="space-y-8 lg:col-span-2">
          {course.description && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                About this course
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                {course.description}
              </p>
            </div>
          )}

          <CourseCurriculum chapters={course.chapters} isEnrolled={isEnrolled} />

          {course.instructor && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Your Instructor
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {course.instructor.full_name?.charAt(0)}
                </span>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {course.instructor.full_name}
                  </div>
                  {course.instructor.bio && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <CourseReviews
            reviews={reviews as any}
            averageRating={course.average_rating}
            totalReviews={course.total_reviews}
          />
        </div>
      </div>
    </div>
  );
}
