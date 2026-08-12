"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface AnswerState {
  error?: string;
}

export async function answerQuestion(
  questionId: string,
  _prevState: AnswerState,
  formData: FormData
): Promise<AnswerState> {
  const admin = await requireAdmin();

  const answer = String(formData.get("answer") ?? "").trim();
  if (!answer) return { error: "Хариултаа бичнэ үү." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lesson_questions")
    .update({
      answer,
      answered_at: new Date().toISOString(),
      answered_by: admin.id,
    })
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  return {};
}

export async function deleteQuestion(questionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("lesson_questions").delete().eq("id", questionId);
  revalidatePath("/admin/questions");
}
