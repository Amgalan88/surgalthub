import Link from "next/link";
import { Check, Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

type NodeState = "done" | "current" | "available" | "locked";

function nodeCircleClasses(state: NodeState) {
  switch (state) {
    case "done":
      return "bg-emerald-600 text-white ring-white";
    case "current":
      return "bg-brand-600 text-white ring-white ring-offset-2 ring-offset-white outline outline-2 outline-brand-200";
    case "available":
      return "bg-white text-navy-900 ring-white border-2 border-slate-300";
    case "locked":
      return "bg-slate-100 text-slate-400 ring-white";
  }
}

export function LessonRoadmap({
  courseSlug,
  lessons,
  completedIds,
  canOpen,
  currentLessonId,
  hasQuiz,
  allLessonsDone,
  quizPassed,
}: {
  courseSlug: string;
  lessons: Lesson[];
  completedIds: Set<string>;
  canOpen: boolean;
  currentLessonId?: string;
  hasQuiz: boolean;
  allLessonsDone: boolean;
  quizPassed: boolean;
}) {
  const items = lessons.map((lesson, i) => {
    const done = completedIds.has(lesson.id);
    const state: NodeState = done
      ? "done"
      : !canOpen
        ? "locked"
        : lesson.id === currentLessonId
          ? "current"
          : "available";
    return { lesson, i, done, state };
  });

  const quizState: NodeState = quizPassed
    ? "done"
    : canOpen && allLessonsDone
      ? "current"
      : "locked";

  return (
    <ol className="mt-4">
      {items.map(({ lesson, i, done, state }) => {
        const node = (
          <div className="group relative flex items-start gap-4">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-8",
                nodeCircleClasses(state)
              )}
            >
              {state === "done" ? (
                <Check size={16} />
              ) : state === "locked" ? (
                <Lock size={13} />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "locked" ? "text-slate-400" : "text-navy-900",
                  state === "current" && "text-brand-700"
                )}
              >
                {lesson.title}
              </p>
              {state === "current" && (
                <p className="mt-0.5 text-xs font-medium text-brand-600">Дараах хичээл</p>
              )}
            </div>
          </div>
        );

        return (
          <li key={lesson.id} className="relative pb-8">
            <span
              aria-hidden
              className={cn(
                "absolute left-4 top-8 -ml-px h-full w-0.5",
                done ? "bg-emerald-500" : "bg-slate-200"
              )}
            />
            {canOpen ? (
              <Link href={`/courses/${courseSlug}/learn/${lesson.id}`}>{node}</Link>
            ) : (
              node
            )}
          </li>
        );
      })}

      {hasQuiz && (
        <li className="relative">
          <div className="group relative flex items-start gap-4">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-8",
                nodeCircleClasses(quizState)
              )}
            >
              {quizState === "done" ? (
                <Award size={16} />
              ) : quizState === "locked" ? (
                <Lock size={13} />
              ) : (
                <Award size={16} />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  quizState === "locked" ? "text-slate-400" : "text-navy-900",
                  quizState === "current" && "text-brand-700"
                )}
              >
                Төгсөлтийн шалгалт
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {quizState === "done"
                  ? "Гэрчилгээ авсан"
                  : quizState === "current"
                    ? "Одоо өгөх боломжтой"
                    : "Бүх хичээлийг дуусгасны дараа нээгдэнэ"}
              </p>
            </div>
            {(quizState === "current" || quizState === "done") && (
              <Link
                href={
                  quizState === "done"
                    ? `/dashboard/certificates`
                    : `/courses/${courseSlug}/quiz`
                }
                className="shrink-0 self-center text-sm font-medium text-brand-600"
              >
                {quizState === "done" ? "Гэрчилгээ" : "Эхлэх"}
              </Link>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
