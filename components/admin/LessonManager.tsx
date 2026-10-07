"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  CircleAlert,
  GripVertical,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Upload,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import {
  deleteLesson,
  quickAddLesson,
  reorderLessons,
  renameLesson,
  setLessonFree,
  setLessonVideo,
} from "@/lib/actions/admin/lessons";
import type { Lesson } from "@/lib/types";

type ManagedLesson = Pick<Lesson, "id" | "title" | "is_free_preview" | "video_url">;

function videoFolder(courseSlug: string) {
  return `cargohub/${courseSlug}`;
}

/** A hidden file input behind a button; uploads the picked video and hands back its URL. */
function VideoUploadButton({
  courseSlug,
  label,
  onUploaded,
  className,
}: {
  courseSlug: string;
  label: string;
  onUploaded: (url: string) => Promise<void> | void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const { url } = await uploadToCloudinary(file, videoFolder(courseSlug), setProgress);
      await onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Байршуулж чадсангүй.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={progress !== null}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-default",
          className
        )}
      >
        {progress !== null ? (
          <>
            <Loader2 size={13} className="animate-spin" /> {Math.round(progress * 100)}%
          </>
        ) : (
          <>
            <Upload size={13} /> {label}
          </>
        )}
      </button>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}

function FreeToggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex w-24 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 disabled:opacity-50"
    >
      <span
        className={cn(
          "relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </span>
      {checked ? "Үнэгүй" : "Premium"}
    </button>
  );
}

function LessonRow({
  lesson,
  index,
  count,
  courseId,
  courseSlug,
  onMoveTo,
  dragging,
  dropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  lesson: ManagedLesson;
  index: number;
  count: number;
  courseId: string;
  courseSlug: string;
  /** Moves this lesson to a 0-based position. */
  onMoveTo: (to: number) => void;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  // Only the grip starts a drag, so selecting text in the row still works.
  const [draggable, setDraggable] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && result.error) setError(result.error);
    });
  }

  function saveTitle() {
    setEditing(false);
    if (title.trim() === lesson.title) return;
    run(() => renameLesson(courseId, lesson.id, title));
  }

  return (
    <li
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={() => {
        setDraggable(false);
        onDragEnd();
      }}
      className={cn(
        "border-t-2 border-transparent bg-white px-4 py-3 sm:px-5",
        pending && "opacity-60",
        dragging && "opacity-40",
        dropTarget && "border-t-brand-600 bg-brand-50/40"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          title="Чирж байрыг нь солих"
          onMouseDown={() => setDraggable(true)}
          onMouseUp={() => setDraggable(false)}
          className="hidden cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing sm:block"
        >
          <GripVertical size={18} />
        </span>
        <select
          aria-label="Байрлал"
          title="Байрлал солих"
          value={index}
          onChange={(e) => onMoveTo(Number(e.target.value))}
          className="h-8 w-14 cursor-pointer rounded-md border border-slate-300 bg-white px-1.5 text-center text-sm tabular-nums text-navy-900 hover:border-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {Array.from({ length: count }, (_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>

        <div className="min-w-0 flex-1 basis-48">
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setTitle(lesson.title);
                  setEditing(false);
                }
              }}
              className="w-full rounded-md border border-brand-600 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Нэр засах"
              className="group flex max-w-full cursor-text items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm font-medium text-navy-900 hover:bg-slate-50"
            >
              <span className="truncate">{lesson.title}</span>
              <Pencil size={12} className="shrink-0 text-slate-300 group-hover:text-slate-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:w-56 sm:justify-end">
          {lesson.video_url ? (
            <a
              href={lesson.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              <Video size={14} /> Видео бий
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
              <CircleAlert size={14} /> Видео алга
            </span>
          )}
          <VideoUploadButton
            courseSlug={courseSlug}
            label={lesson.video_url ? "Солих" : "Видео нэмэх"}
            onUploaded={async (url) => run(() => setLessonVideo(courseId, lesson.id, url))}
          />
        </div>

        <FreeToggle
          checked={lesson.is_free_preview}
          disabled={pending}
          onChange={(free) => run(() => setLessonFree(courseId, lesson.id, free))}
        />

        <details className="relative">
          <summary
            aria-label="Бусад"
            className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
          >
            <MoreHorizontal size={18} />
          </summary>
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-lg">
            <Link
              href={`/courses/${courseSlug}/learn/${lesson.id}`}
              target="_blank"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-navy-900 hover:bg-slate-50"
            >
              <ExternalLink size={14} /> Сайт дээр үзэх
            </Link>
            <Link
              href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-navy-900 hover:bg-slate-50"
            >
              <Pencil size={14} /> Текст, файл нэмэх
            </Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`"${lesson.title}" хичээлийг устгах уу?`)) {
                  run(() => deleteLesson(courseId, lesson.id));
                }
              }}
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Устгах
            </button>
          </div>
        </details>
      </div>
      {error && <p className="mt-1 pl-14 text-xs text-red-600">{error}</p>}
    </li>
  );
}

/** Adds a lesson from a title and an optional video, without leaving the list. */
function QuickAdd({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    setError(null);
    startTransition(async () => {
      const result = await quickAddLesson(courseId, title, videoUrl);
      if (result.error) {
        setError(result.error);
      } else {
        setTitle("");
        setVideoUrl(null);
      }
    });
  }

  return (
    <div className="rounded-b-xl border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5">
      <p className="text-sm font-medium text-navy-900">Шинэ хичээл нэмэх</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && title.trim() && add()}
          placeholder="Хичээлийн нэр"
          className="min-w-0 flex-1 basis-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {videoUrl ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Video size={14} /> Видео бэлэн
          </span>
        ) : (
          <VideoUploadButton
            courseSlug={courseSlug}
            label="Видео сонгох"
            onUploaded={(url) => setVideoUrl(url)}
            className="py-2"
          />
        )}
        <button
          type="button"
          onClick={add}
          disabled={pending || !title.trim()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-default disabled:opacity-50"
        >
          <Plus size={16} /> {pending ? "Нэмж байна..." : "Нэмэх"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Every everyday lesson edit on one screen: rename, reorder, video, free/paid, add, delete. */
export function LessonManager({
  courseId,
  courseSlug,
  lessons,
}: {
  courseId: string;
  courseSlug: string;
  lessons: ManagedLesson[];
}) {
  // The order is shown at once and saved in the background; fresh server data
  // (after any edit) replaces it.
  const [items, setItems] = useState(lessons);
  const [serverLessons, setServerLessons] = useState(lessons);
  if (lessons !== serverLessons) {
    setServerLessons(lessons);
    setItems(lessons);
  }

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  function moveTo(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const previous = items;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setError(null);
    startTransition(async () => {
      const result = await reorderLessons(courseId, next.map((l) => l.id));
      if (result.error) {
        setItems(previous);
        setError(result.error);
        setStatus("error");
      } else {
        setStatus("saved");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2 text-xs sm:px-5">
        <span className="text-slate-500">
          <span className="hidden sm:inline">⠿ дээр барьж чирэх эсвэл </span>дугаар дээр дарж байрыг солино
        </span>
        <span aria-live="polite">
          {saving ? (
            <span className="text-slate-500">Хадгалж байна...</span>
          ) : status === "saved" ? (
            <span className="text-emerald-700">Дараалал хадгалагдлаа</span>
          ) : null}
        </span>
      </div>
      {error && (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:px-5">{error}</p>
      )}

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          Хичээл алга. Доороос эхний хичээлээ нэмээрэй.
        </p>
      ) : (
        <ol className="divide-y divide-slate-100" onDragLeave={() => setDragOver(null)}>
          {items.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={i}
              count={items.length}
              courseId={courseId}
              courseSlug={courseSlug}
              onMoveTo={(to) => moveTo(i, to)}
              dragging={dragFrom === i}
              dropTarget={dragOver === i && dragFrom !== null && dragFrom !== i}
              onDragStart={() => setDragFrom(i)}
              onDragOver={() => setDragOver(i)}
              onDrop={() => {
                if (dragFrom !== null) moveTo(dragFrom, i);
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
            />
          ))}
        </ol>
      )}
      <QuickAdd courseId={courseId} courseSlug={courseSlug} />
    </div>
  );
}
