"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle, FileText, HelpCircle, ClipboardList } from "lucide-react";
import type { Chapter, Lesson } from "@/types";

const iconFor: Record<Lesson["type"], typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

export function LessonSidebar({
  courseSlug,
  courseTitle,
  chapters,
  completedLessonIds,
}: {
  courseSlug: string;
  courseTitle: string;
  chapters: Chapter[];
  completedLessonIds: Set<string>;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-full overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark-subtle">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <Link href={`/courses/${courseSlug}`} className="text-xs text-slate-400 hover:underline">
          ← Back to course details
        </Link>
        <h2 className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
          {courseTitle}
        </h2>
      </div>

      <div className="p-2">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-2">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {chapter.title}
            </div>
            <ul>
              {(chapter.lessons ?? []).map((lesson) => {
                const Icon = iconFor[lesson.type];
                const isActive = pathname === `/learn/${courseSlug}/${lesson.id}`;
                const isCompleted = completedLessonIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${courseSlug}/${lesson.id}`}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                        isActive
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-slate-300" />
                      )}
                      <Icon size={15} className="shrink-0" />
                      <span className="line-clamp-1">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
