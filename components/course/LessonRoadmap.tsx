import Link from "next/link";
import { Check, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessLesson } from "@/lib/access";
import type { Enrollment, LessonOutline, Profile } from "@/lib/types";

type NodeState = "done" | "current" | "available" | "premium" | "locked";

function nodeCircleClasses(state: NodeState) {
  switch (state) {
    case "done":
      return "bg-emerald-600 text-white ring-white";
    case "current":
      return "bg-brand-600 text-white ring-white ring-offset-2 ring-offset-white outline outline-2 outline-brand-200";
    case "available":
      return "bg-white text-navy-900 ring-white border-2 border-slate-300";
    case "premium":
      return "bg-brand-50 text-brand-600 ring-white border-2 border-brand-200";
    case "locked":
      return "bg-slate-100 text-slate-400 ring-white";
  }
}

export function LessonRoadmap({
  courseSlug,
  lessons,
  completedIds,
  enrollment,
  profile,
  currentLessonId,
}: {
  courseSlug: string;
  lessons: LessonOutline[];
  completedIds: Set<string>;
  enrollment: Enrollment | null;
  profile: Profile | null;
  currentLessonId?: string;
}) {
  const enrolled = !!enrollment;

  const items = lessons.map((lesson, i) => {
    const done = completedIds.has(lesson.id);
    const accessible = canAccessLesson(lesson, profile, done);
    let state: NodeState;
    if (!enrolled) state = "locked";
    else if (!accessible) state = "premium";
    else if (done) state = "done";
    else if (lesson.id === currentLessonId) state = "current";
    else state = "available";
    return { lesson, i, done, state, canOpen: enrolled && accessible };
  });

  return (
    <ol className="mt-4" data-tour="lesson-roadmap">
      {items.map(({ lesson, i, done, state, canOpen }) => {
        const isLast = i === items.length - 1;
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
              ) : state === "premium" ? (
                <Crown size={14} />
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
              {state === "premium" && (
                <p className="mt-0.5 text-xs font-medium text-brand-600">
                  Premium — төлбөрөө баталгаажуулснаар нээгдэнэ
                </p>
              )}
            </div>
          </div>
        );

        return (
          <li key={lesson.id} className={cn("relative", !isLast && "pb-8")}>
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-4 top-8 -ml-px h-full w-0.5",
                  done ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}
            {canOpen ? (
              <Link href={`/courses/${courseSlug}/learn/${lesson.id}`}>{node}</Link>
            ) : (
              node
            )}
          </li>
        );
      })}
    </ol>
  );
}
