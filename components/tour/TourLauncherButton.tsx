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
      className="fixed bottom-5 right-5 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-brand-400 shadow-lg shadow-navy-900/30 ring-1 ring-white/10 transition-transform hover:scale-105 hover:bg-navy-800 active:scale-95"
    >
      <HelpCircle size={22} />
    </button>
  );
}
