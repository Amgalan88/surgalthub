"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createQuizQuestion, type QuizQuestionFormState } from "@/lib/actions/admin/quiz";

const initialState: QuizQuestionFormState = {};

export function QuizQuestionForm({
  courseId,
  nextOrderIndex,
}: {
  courseId: string;
  nextOrderIndex: number;
}) {
  const [state, formAction, pending] = useActionState(
    createQuizQuestion,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="order_index" value={nextOrderIndex} />

      <div>
        <Label htmlFor="question">Асуулт</Label>
        <Textarea id="question" name="question" rows={2} required />
      </div>

      <div className="space-y-2">
        <Label>Сонголтууд (доод тал нь 2, зөв хариултын дугуйг сонгоно)</Label>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct_index"
              value={i}
              required
              className="h-4 w-4 accent-brand-600"
            />
            <Input
              name={`option_${i}`}
              placeholder={`Сонголт ${i + 1}${i < 2 ? " (заавал)" : ""}`}
              required={i < 2}
            />
          </div>
        ))}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Нэмж байна..." : "Асуулт нэмэх"}
      </Button>
    </form>
  );
}
