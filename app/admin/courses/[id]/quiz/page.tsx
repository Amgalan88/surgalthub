import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { QuizQuestionForm } from "@/components/admin/QuizQuestionForm";
import { getCourseByIdAdmin, getQuizQuestionsAdmin } from "@/lib/data/admin";
import { deleteQuizQuestion } from "@/lib/actions/admin/quiz";

export default async function AdminQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  const questions = await getQuizQuestionsAdmin(id);

  return (
    <div className="p-6 sm:p-8">
      <Link href={`/admin/courses/${id}/edit`} className="text-sm text-slate-500">
        ← {course.title}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">
        Төгсөлтийн шалгалтын асуултууд
      </h1>

      <div className="mt-6 space-y-3">
        {questions.map((q, qi) => {
          const removeAction = deleteQuizQuestion.bind(null, id, q.id);
          return (
            <Card key={q.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-navy-900">
                    {qi + 1}. {q.question}
                  </p>
                  <form action={removeAction}>
                    <ConfirmSubmitButton
                      confirmMessage="Энэ асуултыг устгах уу?"
                      className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Устгах"
                    >
                      <Trash2 size={16} />
                    </ConfirmSubmitButton>
                  </form>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        oi === q.correct_index
                          ? "bg-emerald-50 font-medium text-emerald-700"
                          : "text-slate-500"
                      }`}
                    >
                      {opt.text} {oi === q.correct_index && "✓"}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            Асуулт алга байна. Доороос эхний асуултаа нэмээрэй.
          </p>
        )}
      </div>

      <Card className="mt-8">
        <CardBody>
          <h2 className="font-semibold text-navy-900">Шинэ асуулт нэмэх</h2>
          <div className="mt-4">
            <QuizQuestionForm courseId={id} nextOrderIndex={questions.length} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
