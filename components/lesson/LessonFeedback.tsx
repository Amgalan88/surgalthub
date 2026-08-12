"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateLesson } from "@/lib/actions/engagement";

export function LessonFeedback({
  courseSlug,
  lessonId,
  initialValue,
}: {
  courseSlug: string;
  lessonId: string;
  initialValue: boolean | null;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  function submit(helpful: boolean) {
    setValue(helpful);
    startTransition(() => rateLesson(courseSlug, lessonId, helpful));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-slate-600">
        Энэ хичээл ойлгомжтой байсан уу?
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pending}
          aria-pressed={value === true}
          aria-label="Тийм, ойлгомжтой байсан"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors disabled:opacity-60",
            value === true
              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/30"
              : "text-slate-500 ring-slate-300 hover:bg-slate-50"
          )}
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={pending}
          aria-pressed={value === false}
          aria-label="Үгүй, ойлгомжгүй байсан"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors disabled:opacity-60",
            value === false
              ? "bg-amber-50 text-amber-700 ring-amber-600/30"
              : "text-slate-500 ring-slate-300 hover:bg-slate-50"
          )}
        >
          <ThumbsDown size={16} />
        </button>
      </div>
      {value !== null && (
        <span className="text-sm text-slate-400">Баярлалаа!</span>
      )}
    </div>
  );
}
