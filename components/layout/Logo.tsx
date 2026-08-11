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

/** Header/footer зэрэг navy дэвсгэр дээр: лого + бичвэр */
export function LogoWordmark({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const heightPx = size === "md" ? 34 : 26;
  const widthPx = Math.round(heightPx * ASPECT);

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-mark.jpg"
        alt="Cargo Hub"
        width={widthPx}
        height={heightPx}
        priority
        className="h-auto rounded-md object-contain ring-1 ring-white/20"
        style={{ height: heightPx, width: "auto" }}
      />
      <span className="text-base font-bold tracking-tight text-white">
        Cargo Hub
      </span>
    </span>
  );
}
