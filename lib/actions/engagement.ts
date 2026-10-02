"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface AskQuestionState {
  error?: string;
  success?: boolean;
}

export async function askLessonQuestion(
  courseSlug: string,
  lessonId: string,
  _prevState: AskQuestionState,
  formData: FormData
): Promise<AskQuestionState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Асуулт илгээхийн тулд нэвтэрнэ үү." };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 5) {
    return { error: "Асуултаа арай дэлгэрэнгүй бичнэ үү." };
  }
  if (body.length > 1000) {
    return { error: "Асуулт хэт урт байна (1000 тэмдэгт хүртэл)." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("lesson_questions")
    .insert({ lesson_id: lessonId, user_id: profile.id, body });

  if (error) {
    console.error("askLessonQuestion failed:", error);
    return { error: "Асуулт илгээж чадсангүй. Дахин оролдоно уу." };
  }

  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
  return { success: true };
}

export async function rateLesson(
  courseSlug: string,
  lessonId: string,
  helpful: boolean
) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase
    .from("lesson_feedback")
    .upsert(
      { lesson_id: lessonId, user_id: profile.id, helpful },
      { onConflict: "lesson_id,user_id" }
    );

  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
}
