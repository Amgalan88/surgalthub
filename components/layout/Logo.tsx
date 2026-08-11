import Image from "next/image";
import { cn } from "@/lib/utils";

const ASPECT = 848 / 440;

export function Logo({
  size = "md",
  banner = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  banner?: boolean;
  className?: string;
}) {
  const heightPx = size === "lg" ? 96 : size === "md" ? 40 : 28;
  const widthPx = Math.round(heightPx * ASPECT);

  return (
    <Image
      src={banner ? "/logo-banner.jpg" : "/logo-mark.jpg"}
      alt="Cargo Hub"
      width={banner ? 1600 : widthPx}
      height={banner ? 896 : heightPx}
      priority
      className={cn("h-auto rounded-md object-contain", className)}
      style={{ height: heightPx, width: "auto" }}
    />
  );
}
