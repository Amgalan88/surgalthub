"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface LessonFormState {
  error?: string;
}

function readMediaFields(formData: FormData) {
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const videoFileUrl = String(formData.get("video_file_url") ?? "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim();
  const audioUrl = String(formData.get("audio_url") ?? "").trim();
  const slidesUrl = String(formData.get("slides_url") ?? "").trim();

  return {
    video_url: videoFileUrl || videoUrl || null,
    cover_image_url: coverImageUrl || null,
    audio_url: audioUrl || null,
    slides_url: slidesUrl || null,
  };
}

export async function createLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  await requireAdmin();

  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const contentMd = String(formData.get("content_md") ?? "").trim();
  const orderIndex = Number(formData.get("order_index") ?? 0);
  const isFreePreview = formData.get("is_free_preview") === "on";

  if (!courseId || !title) {
    return { error: "Гарчиг заавал шаардлагатай." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    content_md: contentMd,
    order_index: orderIndex,
    is_free_preview: isFreePreview,
    ...readMediaFields(formData),
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath("/courses");
  redirect(`/admin/courses/${courseId}/lessons`);
}

export async function updateLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const contentMd = String(formData.get("content_md") ?? "").trim();
  const orderIndex = Number(formData.get("order_index") ?? 0);
  const isFreePreview = formData.get("is_free_preview") === "on";

  if (!id || !title) {
    return { error: "Гарчиг заавал шаардлагатай." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      content_md: contentMd,
      order_index: orderIndex,
      is_free_preview: isFreePreview,
      ...readMediaFields(formData),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath("/courses");
  redirect(`/admin/courses/${courseId}/lessons`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath("/courses");
}
