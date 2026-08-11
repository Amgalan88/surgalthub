"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

/* ── Scroll-reveal wrapper ── */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container + item ── */
export function Stagger({
  children,
  className,
  style,
  staggerGap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  staggerGap?: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerGap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated counter ── */
export function AnimatedNumber({
  value,
  duration = 1.4,
  suffix = "",
  className,
  style,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(
    spring,
    (v) => Math.round(v).toLocaleString("en-US") + suffix
  );
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);
  return (
    <motion.span ref={ref} className={className} style={style}>
      {display}
    </motion.span>
  );
}

/* ── 3D tilt card — mouse дагаж нална ── */
export function TiltCard({
  children,
  className,
  style,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        perspective: 800,
        rotateX: srx,
        rotateY: sry,
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
