"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export function HeroCanvas() {
  return <Hero3D />;
}
