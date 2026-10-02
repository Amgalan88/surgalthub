import { createClient } from "@/lib/supabase/server";
import type { LessonQuestion } from "@/lib/types";

/** A question plus the asker's display name, resolved for the admin queue. */
export interface QuestionWithContext extends LessonQuestion {
  askerName: string | null;
  lessonTitle: string | null;
}

export async function getLessonQuestions(
  lessonId: string
): Promise<QuestionWithContext[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_questions")
    .select("*, profiles!lesson_questions_user_id_fkey(full_name)")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false });

  const rows =
    (data as unknown as (LessonQuestion & {
      profiles: { full_name: string | null } | null;
    })[]) ?? [];

  return rows.map((row) => ({
    ...row,
    askerName: row.profiles?.full_name ?? null,
    lessonTitle: null,
  }));
}

export async function getMyLessonFeedback(
  lessonId: string,
  userId: string
): Promise<boolean | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_feedback")
    .select("helpful")
    .eq("lesson_id", lessonId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.helpful ?? null;
}

/** Admin queue: unanswered questions first, newest within each group. */
export async function getAllQuestions(): Promise<QuestionWithContext[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_questions")
    .select(
      "*, profiles!lesson_questions_user_id_fkey(full_name), lessons(title)"
    )
    .order("created_at", { ascending: false });

  const rows =
    (data as unknown as (LessonQuestion & {
      profiles: { full_name: string | null } | null;
      lessons: { title: string } | null;
    })[]) ?? [];

  return rows
    .map((row) => ({
      ...row,
      askerName: row.profiles?.full_name ?? null,
      lessonTitle: row.lessons?.title ?? null,
    }))
    .sort((a, b) => Number(!!a.answer) - Number(!!b.answer));
}

export interface PlatformStats {
  learners: number;
  lessonsCompleted: number;
  courses: number;
}

/**
 * Aggregate counts used for social proof on the landing page. Goes through a
 * database function because the underlying rows are private to each learner.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("platform_stats").maybeSingle();

  if (error || !data) {
    // Migration 0010 not applied yet: hide the bar rather than show zeros.
    return { learners: 0, lessonsCompleted: 0, courses: 0 };
  }

  return {
    learners: Number(data.learners),
    lessonsCompleted: Number(data.lessons_completed),
    courses: Number(data.courses),
  };
}
