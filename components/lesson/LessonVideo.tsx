"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw } from "lucide-react";

/** Counted as watched once this much of the video has played. */
const WATCHED_RATIO = 0.95;
const SAVE_EVERY_SECONDS = 5;

function positionKey(lessonId: string) {
  return `cargohub:position:${lessonId}`;
}

function readPosition(lessonId: string): number {
  try {
    return Number(localStorage.getItem(positionKey(lessonId))) || 0;
  } catch {
    return 0;
  }
}

function writePosition(lessonId: string, seconds: number | null) {
  try {
    if (seconds === null) localStorage.removeItem(positionKey(lessonId));
    else localStorage.setItem(positionKey(lessonId), String(Math.floor(seconds)));
  } catch {
    // Private mode or blocked storage: resuming is a nicety, not a must.
  }
}

/**
 * The lesson player. Picks up where the learner stopped last time, records the
 * lesson as done once it has been watched (no button to remember), and offers
 * the next lesson when the video ends.
 */
export function LessonVideo({
  lessonId,
  src,
  poster,
  title,
  alreadyDone,
  onWatched,
  next,
}: {
  lessonId: string;
  src: string;
  poster?: string | null;
  title: string;
  alreadyDone: boolean;
  /** Marks the lesson complete; absent for visitors who are not signed in. */
  onWatched?: () => Promise<void>;
  next: { href: string; label: string } | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);
  const reported = useRef(alreadyDone);
  const [ended, setEnded] = useState(false);
  const [, startTransition] = useTransition();

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    const saved = readPosition(lessonId);
    // Ignore positions too close to either end to be worth resuming.
    if (saved > 5 && saved < video.duration - 10) video.currentTime = saved;
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(video.currentTime - lastSaved.current) >= SAVE_EVERY_SECONDS) {
      lastSaved.current = video.currentTime;
      writePosition(lessonId, video.currentTime);
    }

    if (!reported.current && onWatched && video.currentTime / video.duration >= WATCHED_RATIO) {
      reported.current = true;
      startTransition(async () => {
        await onWatched();
      });
    }
  }

  function handleEnded() {
    writePosition(lessonId, null);
    setEnded(true);
  }

  function replay() {
    const video = videoRef.current;
    setEnded(false);
    if (!video) return;
    video.currentTime = 0;
    void video.play();
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={src}
        title={title}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        poster={poster ?? undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setEnded(false)}
        className="aspect-video w-full"
      />

      {ended && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-navy-950/85 px-6 text-center">
          <p className="text-lg font-semibold text-white">Хичээл дууслаа</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {next && (
              <Link
                href={next.href}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                {next.label} <ChevronRight size={16} />
              </Link>
            )}
            <button
              type="button"
              onClick={replay}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/30 hover:bg-white/10"
            >
              <RotateCcw size={15} /> Дахин үзэх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
