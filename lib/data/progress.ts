import { createClient } from "@/lib/supabase/server";
import type { Certificate, Course, Enrollment, QuizAttempt, QuizQuestion } from "@/lib/types";

export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data;
}

export async function getCompletedLessonIds(
  userId: string,
  lessonIds: string[]
): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

export async function getQuizQuestions(courseId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  return data ?? [];
}

export interface PublicQuizQuestion {
  id: string;
  question: string;
  options: { text: string }[];
}

// Never expose correct_index to the client — the answer key must only be
// evaluated server-side inside submitQuiz.
export async function getQuizQuestionsPublic(
  courseId: string
): Promise<PublicQuizQuestion[]> {
  const questions = await getQuizQuestions(courseId);
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));
}

export async function getLatestQuizAttempt(
  userId: string,
  courseId: string
): Promise<QuizAttempt | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getCertificate(
  userId: string,
  courseId: string
): Promise<Certificate | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data;
}

export interface DashboardCourse {
  enrollment: Enrollment;
  course: Course;
  totalLessons: number;
  completedLessons: number;
  certificate: Certificate | null;
}

export async function getDashboardCourses(
  userId: string
): Promise<DashboardCourse[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  const rows = (enrollments as unknown as (Enrollment & { courses: Course })[]) ?? [];
  if (rows.length === 0) return [];

  const courseIds = rows.map((r) => r.courses.id);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", courseIds);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons ?? []) {
    const list = lessonsByCourse.get(l.course_id) ?? [];
    list.push(l.id);
    lessonsByCourse.set(l.course_id, list);
  }
  const certByCourse = new Map((certificates ?? []).map((c) => [c.course_id, c]));

  return rows.map((row) => {
    const courseLessonIds = lessonsByCourse.get(row.courses.id) ?? [];
    return {
      enrollment: row,
      course: row.courses,
      totalLessons: courseLessonIds.length,
      completedLessons: courseLessonIds.filter((id) => completedLessonIds.has(id))
        .length,
      certificate: certByCourse.get(row.courses.id) ?? null,
    };
  });
}

export async function getMyCertificates(userId: string): Promise<
  (Certificate & { courses: { title: string; slug: string } | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*, courses(title, slug)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  return (data as never) ?? [];
}
