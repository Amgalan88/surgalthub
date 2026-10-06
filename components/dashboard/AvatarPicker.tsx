"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";
import { updateAvatar } from "@/lib/actions/profile";

/** A grid of animals; picking one saves it straight away. */
export function AvatarPicker({
  current,
  compact = false,
}: {
  /** The saved choice, or null when the learner has not picked yet. */
  current: string | null;
  /** Fewer columns' worth of padding, for the dashboard welcome card. */
  compact?: boolean;
}) {
  const [selected, setSelected] = useState(current);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(key: string) {
    const previous = selected;
    setSelected(key);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateAvatar(key);
      if (result.error) {
        setSelected(previous);
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Аватар сонгох"
        className={cn("grid max-w-md grid-cols-8 gap-1.5 sm:gap-2", compact && "max-w-sm")}
      >
        {AVATARS.map((animal) => {
          const active = selected === animal.key;
          return (
            <button
              key={animal.key}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={animal.label}
              title={animal.label}
              disabled={pending}
              onClick={() => choose(animal.key)}
              className={cn(
                "relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-2xl transition sm:rounded-xl",
                animal.bg,
                active
                  ? "ring-2 ring-brand-600 ring-offset-2"
                  : "ring-1 ring-inset ring-black/5 hover:scale-105",
                pending && !active && "opacity-60"
              )}
            >
              <span aria-hidden>{animal.emoji}</span>
              {active && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 h-5 text-sm" aria-live="polite">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : pending ? (
          <span className="text-slate-500">Хадгалж байна...</span>
        ) : saved ? (
          <span className="text-emerald-700">Хадгалагдлаа</span>
        ) : null}
      </p>
    </div>
  );
}
