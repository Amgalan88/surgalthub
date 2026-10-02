import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { getSiteUrl } from "@/lib/site";

// Rebuilt at most hourly, so a newly published course shows up the same day
// without hitting the database on every crawler request.
export const revalidate = 3600;

async function getPublishedCourseSlugs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  // Plain anon client: the sitemap is public and must not depend on cookies.
  const supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
  const { data } = await supabase
    .from("courses")
    .select("slug, created_at")
    .eq("published", true);
  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const courses = await getPublishedCourseSlugs();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/premium`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.5 },
    ...courses.map((course) => ({
      url: `${base}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: new Date(course.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
