"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Past this, the page's own button has usually scrolled out of view. */
const SHOW_AFTER_PX = 320;

/**
 * On phones the page's main action stays pinned to the bottom of the screen,
 * so it is always one thumb-tap away. It slides in once the page's own button
 * has scrolled away, so the two are never on screen together, and is hidden
 * from tablet width up.
 */
export function StickyCta({
  href,
  label,
  icon,
  hint,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  /** One short line above the button, e.g. which lesson it opens. */
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      {/* globals.css pads the footer while this is on the page, so nothing hides behind it. */}
      <div
        data-sticky-cta
        aria-hidden={!visible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-200 md:hidden",
          visible ? "translate-y-0" : "pointer-events-none translate-y-full"
        )}
      >
        {hint && <p className="mb-2 truncate text-center text-xs text-slate-500">{hint}</p>}
        <Link
          href={href}
          tabIndex={visible ? undefined : -1}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 active:bg-brand-700"
          )}
        >
          {icon}
          {label}
        </Link>
      </div>
    </>
  );
}
