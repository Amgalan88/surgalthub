import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, Profile } from "@/lib/types";

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  activePremium: number;
  unansweredQuestions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalEnrollments },
    { count: completedEnrollments },
    { count: activePremium },
    { count: unansweredQuestions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .not("completed_at", "is", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("premium_until", new Date().toISOString()),
    supabase
      .from("lesson_questions")
      .select("*", { count: "exact", head: true })
      .is("answer", null),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalCourses: totalCourses ?? 0,
    publishedCourses: publishedCourses ?? 0,
    totalEnrollments: totalEnrollments ?? 0,
    completedEnrollments: completedEnrollments ?? 0,
    activePremium: activePremium ?? 0,
    unansweredQuestions: unansweredQuestions ?? 0,
    completionRate:
      (totalEnrollments ?? 0) > 0
        ? Math.round(((completedEnrollments ?? 0) / (totalEnrollments ?? 1)) * 100)
        : 0,
  };
}

export async function getAllCoursesAdmin(): Promise<
  (Course & { lesson_count: number; enrollment_count: number })[]
> {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    // Same order as the public curriculum, so "Курс 01" is first here too.
    .order("created_at", { ascending: true });

  if (!courses || courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", courseIds);
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .in("course_id", courseIds);

  const lessonCounts = new Map<string, number>();
  for (const l of lessons ?? []) {
    lessonCounts.set(l.course_id, (lessonCounts.get(l.course_id) ?? 0) + 1);
  }
  const enrollmentCounts = new Map<string, number>();
  for (const e of enrollments ?? []) {
    enrollmentCounts.set(e.course_id, (enrollmentCounts.get(e.course_id) ?? 0) + 1);
  }

  return courses.map((c) => ({
    ...c,
    lesson_count: lessonCounts.get(c.id) ?? 0,
    enrollment_count: enrollmentCounts.get(c.id) ?? 0,
  }));
}

export async function getCourseByIdAdmin(id: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("id", id).single();
  return data;
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface UserWithEmail extends Profile {
  email: string | null;
}

export async function getAllUsersWithEmail(): Promise<UserWithEmail[]> {
  const profiles = await getAllUsers();

  try {
    const adminClient = createAdminClient();
    const emailById = new Map<string, string | null>();
    const perPage = 1000;
    for (let page = 1; ; page++) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) emailById.set(u.id, u.email ?? null);
      if (data.users.length < perPage) break;
    }

    return profiles.map((p) => ({ ...p, email: emailById.get(p.id) ?? null }));
  } catch (err) {
    console.error("getAllUsersWithEmail: falling back without email", err);
    return profiles.map((p) => ({ ...p, email: null }));
  }
}
