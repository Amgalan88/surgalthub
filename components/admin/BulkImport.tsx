"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, FolderOpen, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import {
  finishImportCourse,
  hideDemoCourses,
  prepareImportCourse,
  saveImportLesson,
} from "@/lib/actions/admin/import";
import { IMPORT_PLAN, MAX_UPLOAD_BYTES, pickVideo } from "@/lib/lessonImport";

type LessonStatus =
  | { state: "waiting" }
  | { state: "uploading"; progress: number }
  | { state: "done"; note: string }
  | { state: "error"; message: string };

interface PlannedLesson {
  key: string;
  courseSlug: string;
  index: number;
  title: string;
  file: File | null;
  problem: string | null;
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function BulkImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [publish, setPublish] = useState(true);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, LessonStatus>>({});

  // Browsers only offer folder picking through this non-standard attribute.
  useEffect(() => {
    inputRef.current?.setAttribute("webkitdirectory", "");
  }, []);

  // Leaving the page mid-upload would silently stop it.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  const plan: PlannedLesson[] = useMemo(() => {
    if (files.length === 0) return [];
    // Paths look like "hicheel/1. kargo/name.mp4"; drop the chosen folder itself.
    const byFolder = new Map<string, File[]>();
    for (const file of files) {
      const parts = (file.webkitRelativePath || file.name).split("/");
      const dir = parts.slice(1, -1).join("/");
      byFolder.set(dir, [...(byFolder.get(dir) ?? []), file]);
    }

    return IMPORT_PLAN.courses.flatMap((course) =>
      course.lessons.map((lesson, index) => {
        const candidates = byFolder.get(lesson.folder) ?? [];
        const picked = pickVideo(
          candidates.map((f) => f.name),
          lesson.match
        );
        const file = "name" in picked ? candidates.find((f) => f.name === picked.name) ?? null : null;
        let problem = "error" in picked ? picked.error : null;
        if (!problem && candidates.length === 0) problem = `"${lesson.folder}" фолдер олдсонгүй`;
        if (file && file.size > MAX_UPLOAD_BYTES) problem = "100MB-аас том — шахах хэрэгтэй";
        return {
          key: `${course.slug}:${index}`,
          courseSlug: course.slug,
          index,
          title: lesson.title,
          file,
          problem,
        };
      })
    );
  }, [files]);

  const problems = plan.filter((l) => l.problem).length;
  const totalBytes = plan.reduce((sum, l) => sum + (l.file?.size ?? 0), 0);
  const doneCount = Object.values(statuses).filter((s) => s.state === "done").length;

  function setStatus(key: string, status: LessonStatus) {
    setStatuses((prev) => ({ ...prev, [key]: status }));
  }

  function chooseFolder(list: FileList | null) {
    const chosen = Array.from(list ?? []);
    setFiles(chosen);
    setFolderName(chosen[0]?.webkitRelativePath.split("/")[0] ?? null);
    setStatuses({});
    setFinished(false);
    setFatal(null);
  }

  async function start() {
    setRunning(true);
    setFatal(null);
    let current: PlannedLesson | null = null;

    try {
      for (const course of IMPORT_PLAN.courses) {
        const { lessonsWithVideo } = await prepareImportCourse(course.slug);
        const lessons = plan.filter((l) => l.courseSlug === course.slug);
        let totalSeconds = 0;
        let uploadedAll = true;

        for (const lesson of lessons) {
          current = lesson;
          if (lessonsWithVideo.includes(lesson.title)) {
            uploadedAll = false;
            await saveImportLesson(course.slug, lesson.index, null);
            setStatus(lesson.key, { state: "done", note: "Өмнө нь орсон" });
            continue;
          }

          setStatus(lesson.key, { state: "uploading", progress: 0 });
          const uploaded = await uploadToCloudinary(lesson.file!, `cargohub/${course.slug}`, (p) =>
            setStatus(lesson.key, { state: "uploading", progress: p })
          );
          totalSeconds += uploaded.duration;
          await saveImportLesson(course.slug, lesson.index, uploaded.url);
          setStatus(lesson.key, { state: "done", note: "Орсон" });
        }

        current = null;
        await finishImportCourse(course.slug, uploadedAll ? totalSeconds : null, publish);
      }

      if (publish) await hideDemoCourses();
      setFinished(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Алдаа гарлаа.";
      if (current) setStatus(current.key, { state: "error", message });
      else setFatal(message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-navy-900">1. Хичээлийн фолдероо сонгоно уу</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Desktop дээрх <span className="font-medium text-navy-900">hicheel</span> фолдерыг өөрийг нь
          сонгоно. Хөтөч &quot;файлуудыг upload хийх үү&quot; гэж асуувал{" "}
          <span className="font-medium text-navy-900">Upload</span> дарна. Энэ үед юу ч
          илгээгдэхгүй, зөвхөн файлын нэрийг шалгана.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => chooseFolder(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={running}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-slate-50 disabled:opacity-50"
        >
          <FolderOpen size={17} />
          {folderName ? `Сонгосон: ${folderName} (дахин сонгох)` : "Фолдер сонгох"}
        </button>
      </div>

      {plan.length > 0 && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-navy-900">2. Шалгах</h2>
              <p className="text-sm text-slate-500">
                {plan.length} хичээл · {formatMb(totalBytes)}
                {problems > 0 && <span className="text-red-600"> · {problems} асуудалтай</span>}
              </p>
            </div>

            {IMPORT_PLAN.courses.map((course) => (
              <div key={course.slug} className="border-b border-slate-100 last:border-0">
                <p className="bg-slate-50 px-5 py-2.5 text-sm font-medium text-navy-900 sm:px-6">
                  {course.title}
                </p>
                <ol className="divide-y divide-slate-100">
                  {plan
                    .filter((l) => l.courseSlug === course.slug)
                    .map((lesson) => {
                      const status = statuses[lesson.key];
                      return (
                        <li key={lesson.key} className="flex items-center gap-3 px-5 py-2.5 text-sm sm:px-6">
                          <span className="w-5 shrink-0 text-right tabular-nums text-slate-400">
                            {lesson.index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-navy-900">
                              {lesson.title}
                              {lesson.index < course.freeLessons && (
                                <span className="ml-2 text-xs font-medium text-emerald-700">Үнэгүй</span>
                              )}
                            </p>
                            <p className={cn("truncate text-xs", lesson.problem ? "text-red-600" : "text-slate-500")}>
                              {lesson.problem ??
                                (status?.state === "error"
                                  ? status.message
                                  : `${lesson.file?.name} · ${formatMb(lesson.file?.size ?? 0)}`)}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs">
                            {lesson.problem || status?.state === "error" ? (
                              <CircleAlert size={17} className="text-red-500" />
                            ) : status?.state === "uploading" ? (
                              <span className="inline-flex items-center gap-1.5 tabular-nums text-brand-700">
                                <Loader2 size={14} className="animate-spin" />
                                {Math.round(status.progress * 100)}%
                              </span>
                            ) : status?.state === "done" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 size={15} /> {status.note}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                </ol>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold text-navy-900">3. Оруулах</h2>
            <label className="mt-3 flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                disabled={running}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                Дууссаны дараа курсуудыг сайтад шууд нийтлэх, хуучин жишээ курсуудыг нуух
              </span>
            </label>

            {problems > 0 ? (
              <p className="mt-4 text-sm text-red-600">
                Улаанаар тэмдэглэсэн хичээлүүдийн видео олдсонгүй. Зөв фолдер сонгосон эсэхээ шалгана уу.
              </p>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={running || finished}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-default disabled:opacity-60"
              >
                {running ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                {running
                  ? `Оруулж байна… ${doneCount}/${plan.length}`
                  : Object.keys(statuses).length > 0 && !finished
                    ? "Үргэлжлүүлэх"
                    : "Оруулж эхлэх"}
              </button>
            )}

            {running && (
              <p className="mt-3 text-sm text-slate-500">
                Интернэтийн хурдаас хамаараад 10–30 минут болно. Энэ хуудсыг бүү хаагаарай.
                Тасарвал дахин дарахад оруулсан видеонуудаа алгасаад үргэлжилнэ.
              </p>
            )}
            {fatal && <p className="mt-3 text-sm text-red-600">{fatal}</p>}
            {finished && (
              <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Бүх хичээл орлоо.{" "}
                {publish ? (
                  <Link href="/courses" className="font-medium underline underline-offset-2">
                    Сайт дээр харах
                  </Link>
                ) : (
                  <Link href="/admin/courses" className="font-medium underline underline-offset-2">
                    Курсуудаа шалгах
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
