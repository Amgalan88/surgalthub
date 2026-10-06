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

// ---------------------------------------------------------------------------
// One-click edits for the lessons list. Each returns an error message instead
// of throwing, so the row can show it in place.
// ---------------------------------------------------------------------------

export interface QuickEditResult {
  error?: string;
}

function refreshCourse(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath("/", "layout");
}

function isMediaUrl(url: string) {
  return /^https:\/\//.test(url);
}

export async function renameLesson(
  courseId: string,
  lessonId: string,
  title: string
): Promise<QuickEditResult> {
  await requireAdmin();
  const clean = title.trim().slice(0, 200);
  if (!clean) return { error: "Гарчиг хоосон байж болохгүй." };
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update({ title: clean }).eq("id", lessonId);
  if (error) return { error: error.message };
  refreshCourse(courseId);
  return {};
}

export async function setLessonFree(
  courseId: string,
  lessonId: string,
  free: boolean
): Promise<QuickEditResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ is_free_preview: free })
    .eq("id", lessonId);
  if (error) return { error: error.message };
  refreshCourse(courseId);
  return {};
}

export async function setLessonVideo(
  courseId: string,
  lessonId: string,
  videoUrl: string
): Promise<QuickEditResult> {
  await requireAdmin();
  if (!isMediaUrl(videoUrl)) return { error: "Видеоны хаяг буруу байна." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ video_url: videoUrl })
    .eq("id", lessonId);
  if (error) return { error: error.message };
  refreshCourse(courseId);
  return {};
}

/**
 * Swaps a lesson with its neighbour, then renumbers the whole course 0..n-1
 * so gaps or duplicate positions left by older edits disappear too.
 */
export async function moveLesson(
  courseId: string,
  lessonId: string,
  direction: "up" | "down"
): Promise<QuickEditResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { error: error.message };

  const ids = (lessons ?? []).map((l) => l.id);
  const from = ids.indexOf(lessonId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return {};
  [ids[from], ids[to]] = [ids[to], ids[from]];

  const results = await Promise.all(
    ids.map((id, index) => supabase.from("lessons").update({ order_index: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  refreshCourse(courseId);
  return {};
}

/** Adds a lesson at the end of the course from just a title and, optionally, its video. */
export async function quickAddLesson(
  courseId: string,
  title: string,
  videoUrl: string | null
): Promise<QuickEditResult> {
  await requireAdmin();
  const clean = title.trim().slice(0, 200);
  if (!clean) return { error: "Гарчгаа бичнэ үү." };
  if (videoUrl && !isMediaUrl(videoUrl)) return { error: "Видеоны хаяг буруу байна." };

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title: clean,
    content_md: "",
    order_index: (last?.order_index ?? -1) + 1,
    is_free_preview: false,
    video_url: videoUrl,
  });
  if (error) return { error: error.message };
  refreshCourse(courseId);
  return {};
}
