"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { askLessonQuestion, type AskQuestionState } from "@/lib/actions/engagement";

export function AskQuestionForm({
  courseSlug,
  lessonId,
}: {
  courseSlug: string;
  lessonId: string;
}) {
  const action = askLessonQuestion.bind(null, courseSlug, lessonId);
  const [state, formAction, pending] = useActionState<AskQuestionState, FormData>(
    action,
    {}
  );

  if (state.success) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
        Асуулт хүлээн авлаа. Багш хариулмагц энэ хуудсан дээр харагдана.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Textarea
        name="body"
        rows={3}
        required
        placeholder="Энэ хичээлтэй холбоотой юу тодруулмаар байна?"
      />
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="mt-3">
        <Send size={15} />
        {pending ? "Илгээж байна..." : "Асуулт илгээх"}
      </Button>
    </form>
  );
}
