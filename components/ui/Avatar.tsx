import { cn } from "@/lib/utils";
import { avatarFor } from "@/lib/avatars";
import type { Profile } from "@/lib/types";

const sizes = {
  sm: "h-8 w-8 text-lg",
  md: "h-11 w-11 text-2xl",
  lg: "h-20 w-20 text-5xl",
};

/** The learner's animal avatar in a soft coloured circle. */
export function Avatar({
  profile,
  size = "sm",
  className,
}: {
  profile: Pick<Profile, "id" | "avatar" | "full_name">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const animal = avatarFor(profile.id, profile.avatar);
  return (
    <span
      role="img"
      aria-label={profile.full_name ?? animal.label}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full ring-1 ring-inset ring-black/5",
        animal.bg,
        sizes[size],
        className
      )}
    >
      <span aria-hidden className="leading-none">
        {animal.emoji}
      </span>
    </span>
  );
}
