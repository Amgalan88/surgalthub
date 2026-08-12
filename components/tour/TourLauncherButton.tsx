"use client";

import { HelpCircle } from "lucide-react";
import { useTour } from "./TourProvider";

export function TourLauncherButton() {
  const { hasTour, replay } = useTour();

  if (!hasTour) return null;

  return (
    <button
      type="button"
      onClick={replay}
      aria-label="Энэ хуудасны зааврыг харах"
      title="Заавар харах"
      className="fixed bottom-4 right-4 z-[65] flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-brand-400 shadow-lg shadow-navy-900/30 ring-1 ring-white/10 transition-transform hover:scale-105 hover:bg-navy-800 active:scale-95 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"
    >
      <HelpCircle size={21} className="sm:hidden" />
      <HelpCircle size={22} className="hidden sm:block" />
    </button>
  );
}
