"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

export function PdfViewer({
  pdfUrl,
  lessonId,
  courseId,
}: {
  pdfUrl: string;
  lessonId: string;
  courseId: string;
}) {
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    // A PDF lesson is considered "complete" as soon as it's opened —
    // there's no reliable "read to the end" signal for an <iframe> PDF.
    if (marked) return;
    setMarked(true);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, isCompleted: true }),
    });
  }, [lessonId, courseId, marked]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <FileText size={16} /> Lesson material
        </span>
        <a href={pdfUrl} download className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400">
          <Download size={14} /> Download
        </a>
      </div>
      <iframe src={pdfUrl} className="h-[70vh] w-full" title="Lesson PDF" />
    </div>
  );
}
