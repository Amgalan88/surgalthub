"use client";

import { useActionState } from "react";
import { Label, Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CourseFormState } from "@/lib/actions/admin/courses";
import type { Course } from "@/lib/types";

export function CourseForm({
  course,
  action,
}: {
  course?: Course;
  action: (
    state: CourseFormState,
    formData: FormData
  ) => Promise<CourseFormState>;
}) {
  const [state, formAction, pending] = useActionState<CourseFormState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {course && <input type="hidden" name="id" value={course.id} />}

      <div>
        <Label htmlFor="title">Гарчиг</Label>
        <Input
          id="title"
          name="title"
          defaultValue={course?.title}
          placeholder="Жишээ: Карго компани хэрхэн бүртгүүлэх вэ"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Слаг (URL, хоосон бол автоматаар үүснэ)</Label>
        <Input id="slug" name="slug" defaultValue={course?.slug} placeholder="karg-butrguuleh" />
      </div>

      <div>
        <Label htmlFor="track">Чиглэл</Label>
        <Select id="track" name="track" defaultValue={course?.track} required>
          <option value="">Сонгоно уу</option>
          <option value="opening">Карго нээх</option>
          <option value="operating">Карго ажиллуулах</option>
          <option value="platform">Карго вэбсайт ашиглах</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Товч тайлбар</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={course?.description}
          required
        />
      </div>

      <label
        className="flex items-center gap-2 text-sm text-slate-700"
        data-tour="course-published-field"
      >
        <input
          type="checkbox"
          name="published"
          defaultChecked={course?.published}
          className="h-4 w-4 accent-brand-600"
        />
        Нийтэд харагдах (published)
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Хадгалж байна..." : course ? "Хадгалах" : "Үүсгэх"}
      </Button>
    </form>
  );
}
