import { MessageCircleQuestion, Phone, CheckCircle2, Clock } from "lucide-react";
import { AskQuestionForm } from "./AskQuestionForm";
import { LessonFeedback } from "./LessonFeedback";
import { SUPPORT_CONTACT, hasSupportContact } from "@/lib/support";
import type { QuestionWithContext } from "@/lib/data/engagement";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Everything a stuck learner needs at the end of a lesson: a quick signal, a
 * direct line out, and the Q&A thread so repeat questions answer themselves.
 */
export function LessonHelp({
  courseSlug,
  lessonId,
  questions,
  myFeedback,
  currentUserId,
}: {
  courseSlug: string;
  lessonId: string;
  questions: QuestionWithContext[];
  myFeedback: boolean | null;
  currentUserId: string;
}) {
  const visible = questions.filter((q) => q.answer || q.user_id === currentUserId);

  return (
    <section className="mt-10 border-t border-slate-200 pt-6">
      <LessonFeedback
        courseSlug={courseSlug}
        lessonId={lessonId}
        initialValue={myFeedback}
      />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900">
          <MessageCircleQuestion size={19} className="text-brand-600" />
          Гацсан уу? Асуугаарай
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Багш хариулсны дараа хариулт энд харагдана — бусад суралцагчид ч мөн
          хэрэг болно.
        </p>

        {hasSupportContact() && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUPPORT_CONTACT.messenger && (
              <a
                href={SUPPORT_CONTACT.messenger}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-navy-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <MessageCircleQuestion size={15} className="text-brand-600" />
                Messenger-ээр шууд бичих
              </a>
            )}
            {SUPPORT_CONTACT.phone && (
              <a
                href={`tel:${SUPPORT_CONTACT.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-navy-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <Phone size={15} className="text-brand-600" />
                {SUPPORT_CONTACT.phone}
              </a>
            )}
          </div>
        )}

        <div className="mt-4">
          <AskQuestionForm courseSlug={courseSlug} lessonId={lessonId} />
        </div>

        {visible.length > 0 && (
          <ul className="mt-6 space-y-4">
            {visible.map((q) => (
              <li
                key={q.id}
                className="rounded-xl bg-white p-4 ring-1 ring-inset ring-slate-200"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span className="font-medium text-slate-600">
                    {q.askerName ?? "Суралцагч"}
                  </span>
                  <span>{formatDate(q.created_at)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-900">
                  {q.body}
                </p>

                {q.answer ? (
                  <div className="mt-3 rounded-lg bg-brand-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
                      <CheckCircle2 size={13} /> Багшийн хариулт
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-brand-900/90">
                      {q.answer}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} /> Хариулт хүлээгдэж байна
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
