import Link from "next/link";
import { Check, Lock, Crown, Play, RotateCcw } from "lucide-react";
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

/**
 * Rendered as a span when the whole row is already a link, so the button is a
 * visual affordance rather than an anchor nested inside another anchor.
 */
function WatchLabel({ state }: { state: NodeState }) {
  const isDone = state === "done";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        isDone
          ? "text-slate-500 ring-1 ring-inset ring-slate-300 group-hover:bg-slate-50"
          : state === "current"
            ? "bg-brand-600 text-white group-hover:bg-brand-700"
            : "text-brand-700 ring-1 ring-inset ring-brand-300 group-hover:bg-brand-50"
      )}
    >
      {isDone ? <RotateCcw size={13} /> : <Play size={13} />}
      {isDone ? "Дахин үзэх" : "Үзэх"}
    </span>
  );
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    state === "locked" ? "text-slate-400" : "text-navy-900",
                    state === "current" && "text-brand-700"
                  )}
                >
                  {lesson.title}
                </p>
                {lesson.is_free_preview && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Үнэгүй
                  </span>
                )}
              </div>
              {state === "current" && (
                <p className="mt-0.5 text-xs font-medium text-brand-600">
                  Дараах хичээл
                </p>
              )}
              {state === "premium" && (
                <p className="mt-0.5 text-xs font-medium text-brand-600">
                  Premium — төлбөрөө баталгаажуулснаар нээгдэнэ
                </p>
              )}
              {state === "locked" && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Сургалтад бүртгүүлснээр нээгдэнэ
                </p>
              )}
            </div>

            {canOpen && (
              <span className="pt-0.5">
                <WatchLabel state={state} />
              </span>
            )}
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
              <Link
                href={`/courses/${courseSlug}/learn/${lesson.id}`}
                className="block rounded-xl transition-colors hover:bg-slate-50/80"
              >
                {node}
              </Link>
            ) : (
              <div className="relative">
                {node}
                {state === "premium" && (
                  <div className="mt-2 pl-12">
                    <Link
                      href="/premium"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      <Crown size={13} /> Нээх
                    </Link>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
