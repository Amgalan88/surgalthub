"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/admin/MediaUploader";
import type { LessonFormState } from "@/lib/actions/admin/lessons";
import type { Lesson } from "@/lib/types";
import { isYoutubeUrl } from "@/lib/video";

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

      {/* Position is managed with the arrows on the lessons list. */}
      <input
        type="hidden"
        name="order_index"
        value={lesson?.order_index ?? nextOrderIndex ?? 0}
      />

      <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="is_free_preview"
          defaultChecked={lesson?.is_free_preview ?? nextOrderIndex === 0}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        <span>
          Үнэгүй хичээл
          <span className="mt-0.5 block text-xs text-slate-500">
            Бүртгэлгүй хүн ч үзнэ. Унтраавал зөвхөн Premium эрхтэй хүн үзнэ.
          </span>
        </span>
      </label>

      <div className="rounded-xl border border-slate-200 p-4">
        <MediaUploader
          fieldName="video_file_url"
          label="Видео"
          accept="video/*"
          folder="lessons/videos"
          initialUrl={lesson?.video_url && !isYoutubeUrl(lesson.video_url) ? lesson.video_url : null}
        />
        <details className="mt-3" open={Boolean(lesson?.video_url && isYoutubeUrl(lesson.video_url))}>
          <summary className="cursor-pointer text-xs font-medium text-slate-500">
            Эсвэл YouTube холбоос ашиглах
          </summary>
          <Input
            name="video_url"
            className="mt-2"
            defaultValue={lesson?.video_url && isYoutubeUrl(lesson.video_url) ? lesson.video_url : ""}
            placeholder="https://youtube.com/watch?v=..."
          />
        </details>
      </div>

      <div>
        <Label htmlFor="content_md">Хичээлийн доор гарах текст (заавал биш)</Label>
        <Textarea
          id="content_md"
          name="content_md"
          rows={8}
          defaultValue={lesson?.content_md}
          placeholder={"Жишээ нь хичээлийн гол санаа, холбоос.\n\n## Гарчиг\n- Алхам 1\n- Алхам 2"}
        />
        <p className="mt-1 text-xs text-slate-500">
          ## гарчиг, - жагсаалт, **тод** гэж бичиж болно.
        </p>
      </div>

      <details className="rounded-xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy-900">
          Нэмэлт материал (зураг, аудио, PDF слайд)
        </summary>
        <div className="mt-4 space-y-4">
          <MediaUploader
            fieldName="cover_image_url"
            label="Видеоны өмнө харагдах зураг"
            accept="image/*"
            folder="lessons/images"
            initialUrl={lesson?.cover_image_url}
          />
          <MediaUploader
            fieldName="audio_url"
            label="Аудио"
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
      </details>

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
