import { QuestionsList } from "@/components/admin/QuestionsList";
import { getAllQuestions } from "@/lib/data/engagement";

export default async function AdminQuestionsPage() {
  const questions = await getAllQuestions();
  const pending = questions.filter((q) => !q.answer).length;

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Асуултууд</h1>
      <p className="mt-1 text-slate-500">
        {pending > 0
          ? `${pending} асуулт хариулт хүлээж байна. Хариулсан асуулт тухайн хичээлийн хуудсанд бүх суралцагчид харагдана.`
          : "Бүх асуултад хариулсан байна."}
      </p>

      <div className="mt-8" data-tour="admin-questions">
        <QuestionsList questions={questions} />
      </div>
    </div>
  );
}
