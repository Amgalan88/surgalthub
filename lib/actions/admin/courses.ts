"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CourseTrack } from "@/lib/types";

export interface CourseFormState {
  error?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яөүёэ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createCourse(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const track = String(formData.get("track") ?? "") as CourseTrack;
  const published = formData.get("published") === "on";
  const price = Math.max(0, Number(formData.get("price") ?? 0) || 0);

  if (!title || !description || !track) {
    return { error: "Бүх талбарыг бөглөнө үү." };
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  if (!slug) return { error: "Слаг үүсгэж чадсангүй." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({ title, description, track, published, price, slug, created_by: admin.id })
    .select("id")
    .single();

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Энэ слаг өмнө нь ашиглагдсан байна. Өөр нэр сонгоно уу."
          : error.message,
    };
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect(`/admin/courses/${data.id}/edit`);
}

export async function updateCourse(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const track = String(formData.get("track") ?? "") as CourseTrack;
  const published = formData.get("published") === "on";
  const price = Math.max(0, Number(formData.get("price") ?? 0) || 0);

  if (!id || !title || !description || !track) {
    return { error: "Бүх талбарыг бөглөнө үү." };
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ title, description, track, published, price, slug })
    .eq("id", id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Энэ слаг өмнө нь ашиглагдсан байна. Өөр нэр сонгоно уу."
          : error.message,
    };
  }

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}/edit`);
  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
  return {};
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function toggleCoursePublished(id: string, next: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("courses").update({ published: next }).eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}
