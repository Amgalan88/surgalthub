"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  answerQuestion,
  deleteQuestion,
  type AnswerState,
} from "@/lib/actions/admin/questions";
import type { QuestionWithContext } from "@/lib/data/engagement";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
  });
}

function AnswerForm({ question }: { question: QuestionWithContext }) {
  const action = answerQuestion.bind(null, question.id);
  const [state, formAction, pending] = useActionState<AnswerState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="mt-3">
      <Textarea
        name="answer"
        rows={3}
        required
        defaultValue={question.answer ?? ""}
        placeholder="Хариултаа бичнэ үү..."
      />
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} size="sm" className="mt-2.5">
        {pending
          ? "Хадгалж байна..."
          : question.answer
            ? "Хариултыг шинэчлэх"
            : "Хариулах"}
      </Button>
    </form>
  );
}

export function QuestionsList({
  questions,
}: {
  questions: QuestionWithContext[];
}) {
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
        Одоогоор асуулт ирээгүй байна.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {questions.map((q) => {
        const removeAction = deleteQuestion.bind(null, q.id);
        return (
          <li
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {q.answer ? (
                  <Badge tone="green">
                    <CheckCircle2 size={12} /> Хариулсан
                  </Badge>
                ) : (
                  <Badge tone="brand">
                    <Clock size={12} /> Хүлээгдэж буй
                  </Badge>
                )}
                {q.lessonTitle && (
                  <span className="text-xs text-slate-400">{q.lessonTitle}</span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(q.created_at)}
              </span>
            </div>

            <p className="mt-2.5 text-xs font-medium text-slate-500">
              {q.askerName ?? "Суралцагч"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-navy-900">{q.body}</p>

            <AnswerForm question={q} />

            <form action={removeAction} className="mt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-600"
              >
                <Trash2 size={13} /> Устгах
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
