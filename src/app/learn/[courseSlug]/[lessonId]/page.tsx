import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LessonSidebar } from "@/components/course/lesson-sidebar";
import { VideoPlayer } from "@/components/course/video-player";
import { PdfViewer } from "@/components/course/pdf-viewer";
import { QuizPlayer } from "@/components/course/quiz-player";
import { BookmarkButton } from "@/components/course/bookmark-button";
import type { Chapter } from "@/types";

interface Props {
  params: { courseSlug: string; lessonId: string };
}

export default async function LessonPage({ params }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, chapters(*, lessons(*))")
    .eq("slug", params.courseSlug)
    .single();
  if (!course) notFound();

  const sortedChapters: Chapter[] = (course.chapters ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    }));

  const allLessons = sortedChapters.flatMap((c) => c.lessons ?? []);
  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  const currentLesson = allLessons[currentIndex];
  if (!currentLesson) notFound();

  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  const [{ data: progressRows }, { data: lessonProgress }, { data: bookmark }, { data: quizQuestions }] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id, is_completed").eq("user_id", user.id).in(
      "lesson_id",
      allLessons.map((l) => l.id)
    ),
    supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", params.lessonId)
      .maybeSingle(),
    supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("lesson_id", params.lessonId).maybeSingle(),
    currentLesson.type === "quiz"
      ? supabase.from("quiz_questions").select("*").eq("lesson_id", params.lessonId).order("display_order")
      : Promise.resolve({ data: null }),
  ]);

  const completedLessonIds = new Set((progressRows ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id));

  return (
    <div className="flex h-screen">
      <div className="hidden w-80 shrink-0 lg:block">
        <LessonSidebar
          courseSlug={course.slug}
          courseTitle={course.title}
          chapters={sortedChapters}
          completedLessonIds={completedLessonIds}
        />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {currentLesson.title}
            </h1>
            <BookmarkButton lessonId={currentLesson.id} initiallyBookmarked={!!bookmark} />
          </div>

          {currentLesson.type === "video" && currentLesson.video_url && (
            <VideoPlayer
              videoUrl={currentLesson.video_url}
              lessonId={currentLesson.id}
              courseId={course.id}
              initialPosition={lessonProgress?.last_position_seconds ?? 0}
            />
          )}

          {currentLesson.type === "pdf" && currentLesson.pdf_url && (
            <PdfViewer pdfUrl={currentLesson.pdf_url} lessonId={currentLesson.id} courseId={course.id} />
          )}

          {currentLesson.type === "quiz" && quizQuestions && quizQuestions.length > 0 && (
            <QuizPlayer questions={quizQuestions as any} lessonId={currentLesson.id} courseId={course.id} />
          )}

          {currentLesson.type === "assignment" && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white">Assignment</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                {currentLesson.content}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Assignment submission uploads are handled via the course's instructor tools.
              </p>
            </div>
          )}

          {currentLesson.content && currentLesson.type !== "assignment" && (
            <div className="card mt-6 p-6">
              <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                {currentLesson.content}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {prevLesson ? (
              <Link
                href={`/learn/${course.slug}/${prevLesson.id}`}
                className="btn-secondary gap-1.5"
              >
                <ChevronLeft size={16} /> Previous
              </Link>
            ) : (
              <span />
            )}
            {nextLesson && (
              <Link href={`/learn/${course.slug}/${nextLesson.id}`} className="btn-primary gap-1.5">
                Next <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
