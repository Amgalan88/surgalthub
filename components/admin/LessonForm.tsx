"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/admin/MediaUploader";
import type { LessonFormState } from "@/lib/actions/admin/lessons";
import type { Lesson } from "@/lib/types";

export function LessonForm({
  courseId,
  lesson,
  nextOrderIndex,
  action,
}: {
  courseId: string;
  lesson?: Lesson;
  nextOrderIndex?: number;
  action: (
    state: LessonFormState,
    formData: FormData
  ) => Promise<LessonFormState>;
}) {
  const [state, formAction, pending] = useActionState<LessonFormState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="course_id" value={courseId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}

      <div>
        <Label htmlFor="title">Гарчиг</Label>
        <Input id="title" name="title" defaultValue={lesson?.title} required />
      </div>

      <div>
        <Label htmlFor="order_index">Эрэмбэ</Label>
        <Input
          id="order_index"
          name="order_index"
          type="number"
          defaultValue={lesson?.order_index ?? nextOrderIndex ?? 0}
        />
      </div>

      <label
        className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
        data-tour="lesson-free-preview-field"
      >
        <input
          type="checkbox"
          name="is_free_preview"
          defaultChecked={lesson?.is_free_preview ?? nextOrderIndex === 0}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        <span>
          Үнэгүй үзэх боломжтой (preview)
          <span className="mt-0.5 block text-xs text-slate-500">
            Төлбөртэй курсын хувьд ч гэсэн энэ хичээлийг бүх бүртгүүлсэн
            хэрэглэгч үзэх боломжтой байна.
          </span>
        </span>
      </label>

      <div className="rounded-xl border border-slate-200 p-4" data-tour="lesson-media-block">
        <h3 className="text-sm font-semibold text-navy-900">Медиа</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Cloudinary руу шууд байршина. Видео нэмэхдээ YouTube холбоос эсвэл
          файл аль нэгийг ашиглаж болно.
        </p>

        <div className="mt-4 space-y-4">
          <MediaUploader
            fieldName="cover_image_url"
            label="Гарчгийн зураг"
            accept="image/*"
            folder="lessons/images"
            initialUrl={lesson?.cover_image_url}
          />

          <div>
            <Label htmlFor="video_url">Видео холбоос (YouTube)</Label>
            <Input
              id="video_url"
              name="video_url"
              defaultValue={lesson?.video_url ?? ""}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <MediaUploader
            fieldName="video_file_url"
            label="Эсвэл видео файл байршуулах"
            accept="video/*"
            folder="lessons/videos"
          />

          <MediaUploader
            fieldName="audio_url"
            label="Аудио (дуу хоолболт)"
            accept="audio/*"
            folder="lessons/audio"
            initialUrl={lesson?.audio_url}
          />

          <MediaUploader
            fieldName="slides_url"
            label="Слайд (PDF)"
            accept="application/pdf"
            folder="lessons/slides"
            initialUrl={lesson?.slides_url}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="content_md">
          Хичээлийн агуулга (Markdown дэмжинэ)
        </Label>
        <Textarea
          id="content_md"
          name="content_md"
          rows={14}
          defaultValue={lesson?.content_md}
          placeholder={"## Гарчиг\n\n- Алхам 1\n- Алхам 2"}
          className="font-mono text-xs"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Хадгалж байна..." : lesson ? "Хадгалах" : "Нэмэх"}
      </Button>
    </form>
  );
}
