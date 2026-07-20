"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, FileText, HelpCircle, ClipboardList, Lock } from "lucide-react";
import type { Chapter, Lesson } from "@/types";

const iconFor: Record<Lesson["type"], typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
}

export function CourseCurriculum({
  chapters,+
  isEnrolled,
}: {
  chapters: Chapter[];
  isEnrolled: boolean;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([chapters[0]?.id]));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalLessons = chapters.reduce((sum, c) => sum + (c.lessons?.length ?? 0), 0);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Course Content
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {chapters.length} chapters • {totalLessons} lessons
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {chapters.map((chapter) => {
          const isOpen = openIds.has(chapter.id);
          return (
            <div key={chapter.id}>
              <button
                onClick={() => toggle(chapter.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-slate-900 dark:text-white">{chapter.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <ul className="space-y-1 px-4 pb-4">
                  {(chapter.lessons ?? []).map((lesson) => {
                    const Icon = iconFor[lesson.type];
                    const canAccess = isEnrolled || lesson.is_preview;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Icon size={15} />
                          {lesson.title}
                          {lesson.is_preview && (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                              Preview
                            </span>
                          )}
                        </span>
                        {!canAccess && <Lock size={14} className="text-slate-400" />}
                        {lesson.video_duration_seconds && (
                          <span className="text-xs text-slate-400">
                            {Math.round(lesson.video_duration_seconds / 60)}m
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
