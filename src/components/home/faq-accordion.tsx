"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-slate-900 dark:text-white">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
