"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formatVideoDuration,
  IMPORT_PLAN,
  posterFromVideo,
  type ImportCourse,
} from "@/lib/lessonImport";

function planCourse(slug: string): ImportCourse {
  const course = IMPORT_PLAN.courses.find((c) => c.slug === slug);
  if (!course) throw new Error(`Төлөвлөгөөнд "${slug}" курс алга.`);
  return course;
}

/**
 * Creates the course (hidden) or refreshes its text from the plan, and reports
 * which lessons already have a video so the browser can skip re-uploading them.
 */
export async function prepareImportCourse(
  slug: string
): Promise<{ lessonsWithVideo: string[] }> {
  await requireAdmin();
  const plan = planCourse(slug);
  const supabase = await createClient();

  const fields = {
    slug: plan.slug,
    title: plan.title,
    description: plan.description,
    track: plan.track,
    outcomes: plan.outcomes,
  };
  const { data: existing, error: findError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  const { data: saved, error } = existing
    ? await supabase.from("courses").update(fields).eq("id", existing.id).select("id").single()
    : await supabase
        .from("courses")
        .insert({ ...fields, published: false, price: 0 })
        .select("id")
        .single();
  if (error) throw new Error(error.message);

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("title, video_url")
    .eq("course_id", saved.id);
  if (lessonsError) throw new Error(lessonsError.message);

  return {
    lessonsWithVideo: (lessons ?? []).filter((l) => l.video_url).map((l) => l.title),
  };
}

/** Writes one lesson from the plan; `videoUrl` is null when it was uploaded earlier. */
export async function saveImportLesson(
  slug: string,
  index: number,
  videoUrl: string | null
): Promise<void> {
  await requireAdmin();
  const plan = planCourse(slug);
  const lesson = plan.lessons[index];
  if (!lesson) throw new Error("Хичээл олдсонгүй.");
  if (videoUrl && !videoUrl.startsWith("https://res.cloudinary.com/")) {
    throw new Error("Видеоны хаяг буруу байна.");
  }

  const supabase = await createClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();
  if (courseError) throw new Error(courseError.message);

  const { data: prior } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id)
    .eq("title", lesson.title)
    .maybeSingle();

  const fields = {
    course_id: course.id,
    title: lesson.title,
    order_index: index,
    is_free_preview: index < plan.freeLessons,
    ...(videoUrl ? { video_url: videoUrl } : {}),
  };
  const { error } = prior
    ? await supabase.from("lessons").update(fields).eq("id", prior.id)
    : await supabase.from("lessons").insert({ ...fields, content_md: "" });
  if (error) throw new Error(error.message);
}

/**
 * Sets the cover from the first lesson's video and, when every video was
 * uploaded in this run (so their lengths are known), the total length.
 */
export async function finishImportCourse(
  slug: string,
  totalSeconds: number | null,
  publish: boolean
): Promise<void> {
  await requireAdmin();
  const plan = planCourse(slug);
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();
  if (courseError) throw new Error(courseError.message);

  const { data: first } = await supabase
    .from("lessons")
    .select("video_url")
    .eq("course_id", course.id)
    .eq("title", plan.lessons[0]?.title ?? "")
    .maybeSingle();

  const { error } = await supabase
    .from("courses")
    .update({
      ...(first?.video_url ? { cover_image: posterFromVideo(first.video_url) } : {}),
      ...(totalSeconds ? { duration_label: formatVideoDuration(totalSeconds) } : {}),
      ...(publish ? { published: true } : {}),
    })
    .eq("id", course.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

/** Hides the sample courses that shipped with the site once the real ones are live. */
export async function hideDemoCourses(): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ published: false })
    .in("slug", IMPORT_PLAN.demoCourseSlugs);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
