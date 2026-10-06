"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EVERY_MS = 30_000;

/**
 * Re-fetches the admin page's server data on an interval and when the tab
 * comes back into focus, so a learner's new payment shows up (with its count
 * in the menu) without the admin having to reload.
 */
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, EVERY_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  return null;
}
