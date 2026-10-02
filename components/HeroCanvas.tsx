"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

// The globe is decoration at 12% opacity. On phones it costs a large
// three.js download and battery for something barely visible, so it is only
// loaded on wider screens for people who have not asked for reduced motion.
const QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function HeroCanvas() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );

  return enabled ? <Hero3D /> : null;
}
