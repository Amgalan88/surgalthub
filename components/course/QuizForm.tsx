"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitQuiz, type QuizResult } from "@/lib/actions/learning";
import type { PublicQuizQuestion } from "@/lib/data/progress";

const initialState: QuizResult = {
  score: 0,
  passed: false,
  total: 0,
  correctCount: 0,
  submitted: false,
};

export function QuizForm({
  courseId,
  courseSlug,
  questions,
}: {
  courseId: string;
  courseSlug: string;
  questions: PublicQuizQuestion[];
}) {
  const [state, formAction, pending] = useActionState(submitQuiz, initialState);

  if (state.submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 p-8 text-center">
        {state.passed ? (
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
        ) : (
          <XCircle className="mx-auto text-red-500" size={48} />
        )}
        <h2 className="mt-4 text-2xl font-bold text-navy-900">
          {state.passed ? "Баяр хүргэе!" : "Дахин оролдоно уу"}
        </h2>
        <p className="mt-2 text-slate-500">
          Та {state.total} асуултаас {state.correctCount}-г зөв хариулж,{" "}
          {state.score}% авлаа.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {state.passed ? (
            <Link
              href={`/dashboard/certificates`}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Гэрчилгээ харах
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}/quiz`}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Дахин өгөх
            </Link>
          )}
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
          >
            Курс руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="course_slug" value={courseSlug} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {questions.map((q, qi) => (
        <fieldset
          key={q.id}
          className="rounded-xl border border-slate-200 p-5"
        >
          <legend className="px-1 text-sm font-semibold text-navy-900">
            {qi + 1}. {q.question}
          </legend>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
              >
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value={oi}
                  required
                  className="accent-brand-600"
                />
                {opt.text}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Илгээж байна..." : "Шалгалт дуусгах"}
      </Button>
    </form>
  );
}
