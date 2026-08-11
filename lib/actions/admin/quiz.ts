"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { QuizOption } from "@/lib/types";

export interface QuizQuestionFormState {
  error?: string;
}

function parseOptions(formData: FormData): QuizOption[] {
  const options: QuizOption[] = [];
  for (let i = 0; i < 4; i++) {
    const text = String(formData.get(`option_${i}`) ?? "").trim();
    if (text) options.push({ text });
  }
  return options;
}

export async function createQuizQuestion(
  _prevState: QuizQuestionFormState,
  formData: FormData
): Promise<QuizQuestionFormState> {
  await requireAdmin();

  const courseId = String(formData.get("course_id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const correctIndex = Number(formData.get("correct_index") ?? -1);
  const orderIndex = Number(formData.get("order_index") ?? 0);
  const options = parseOptions(formData);

  if (!courseId || !question) return { error: "Асуултаа бичнэ үү." };
  if (options.length < 2) return { error: "Дор хаяж 2 сонголт оруулна уу." };
  if (correctIndex < 0 || correctIndex >= options.length) {
    return { error: "Зөв хариултаа сонгоно уу." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").insert({
    course_id: courseId,
    question,
    options,
    correct_index: correctIndex,
    order_index: orderIndex,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}/quiz`);
  return {};
}

export async function deleteQuizQuestion(courseId: string, questionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("quiz_questions").delete().eq("id", questionId);
  revalidatePath(`/admin/courses/${courseId}/quiz`);
}
