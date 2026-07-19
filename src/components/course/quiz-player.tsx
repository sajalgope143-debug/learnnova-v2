"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
}

export function QuizPlayer({
  questions,
  lessonId,
  courseId,
}: {
  questions: QuizQuestion[];
  lessonId: string;
  courseId: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  function selectAnswer(questionId: string, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    const correctCount = questions.filter((q) => answers[q.id] === q.correct_option_index).length;
    const percentScore = Math.round((correctCount / questions.length) * 100);
    setScore(percentScore);
    setSubmitted(true);

    const passed = percentScore >= 70; // 70% pass threshold — adjust as needed
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, isCompleted: passed }),
    });

    toast[passed ? "success" : "error"](
      passed ? `You scored ${percentScore}%! Lesson complete.` : `You scored ${percentScore}%. Try again to pass (70%+).`
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={q.id} className="card p-5">
          <p className="font-medium text-slate-900 dark:text-white">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((option, oi) => {
              const isSelected = answers[q.id] === oi;
              const isCorrect = oi === q.correct_option_index;
              let stateClass = "border-slate-200 dark:border-slate-700";
              if (submitted) {
                if (isCorrect) stateClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
                else if (isSelected && !isCorrect) stateClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
              } else if (isSelected) {
                stateClass = "border-brand-500 bg-brand-50 dark:bg-brand-950";
              }

              return (
                <button
                  key={oi}
                  onClick={() => selectAnswer(q.id, oi)}
                  disabled={submitted}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition ${stateClass}`}
                >
                  {option}
                  {submitted && isCorrect && <CheckCircle2 size={16} className="text-green-600" />}
                  {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button onClick={handleSubmit} className="btn-primary w-full">
          Submit Quiz
        </button>
      ) : (
        <div className="card p-5 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{score}%</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {score >= 70 ? "Great job! Lesson marked complete." : "Score 70% or higher to pass this quiz."}
          </p>
          {score < 70 && (
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              className="btn-secondary mt-3"
            >
              Retry Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
